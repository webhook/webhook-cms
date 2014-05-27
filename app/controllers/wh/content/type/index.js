import getItemModelName from 'appkit/utils/model';

export default Ember.ArrayController.extend({
  sortProperties : ['data.publish_date'],
  sortAscending  : false,
  sortedByPublish: true,

  contentType: null,
  lockedItems: Ember.A([]),

  recordLimit: 0,
  originalRecordLimit: 0,
  limited: function () {
    return this.get('content.length') >= this.get('recordLimit');
  }.property('recordLimit'),

  filterQuery: '',

  columnChoices: function () {
    return this.get('contentType.controls').rejectBy('name', 'name').rejectBy('name', 'preview_url');
  }.property('contentType.controls.@each'),

  cmsControls: function () {
    return this.get('contentType.controls').filterBy('showInCms');
  }.property('contentType.controls.@each.showInCms'),

  _updateItemControls: function (item) {
    var cmsControls = Ember.A([]);
    this.get('cmsControls').forEach(function (control) {
      cmsControls.pushObject({
        value: item.get('data')[control.get('name')],
        controlType: control.get('controlType')
      });
    });
    item.set('cmsControls', cmsControls);
    return item;
  },

  sortedByChanged: function () {
    this.setProperties({
      sortedByPublish: false,
      sortedByCreated: false,
      sortedByAlpha: false
    });

    switch (this.get('sortProperties.firstObject')) {
    case 'data.publish_date':
      this.set('sortedByPublish', true);
      break;
    case 'data.create_date':
      this.set('sortedByCreated', true);
      break;
    case 'data.name':
      this.set('sortedByAlpha', true);
      break;
    }

  }.observes('sortProperties'),

  cmsItems: Ember.arrayComputed('model.@each.data', 'cmsControls.@each.showInCms', {
    addedItem: function (array, item, changeMeta) {

      if (item.constructor.typeKey === 'control') {
        array.forEach(this._updateItemControls.bind(this));
      } else {
        array.pushObject(this._updateItemControls(item));
      }

      return array;
    },
    removedItem: function (array, item) {
      if (item.constructor.typeKey !== 'control') {
        array.removeObject(item);
      }
      return array;
    }
  }),

  sortedCmsItems: function () {

    var filterQuery = this.get('filterQuery');

    var sortedCmsItems = this.get('cmsItems').sortBy.apply(this, this.get('sortProperties'));

    if (!this.get('sortAscending')) {
      sortedCmsItems.reverse();
    }

    sortedCmsItems = sortedCmsItems.filter(function (item) {
      if (!filterQuery) {
        return true;
      } else {
        return (new RegExp(filterQuery, 'ig')).test(item.get('data.name'));
      }
    });

    return sortedCmsItems;
  }.property('cmsItems.@each', 'sortProperties', 'sortAscending', 'filterQuery'),

  locksChanged: function () {
    this.get('cmsItems').setEach('lockedBy', null);
    this.get('lockedItems').forEach(function (lock) {
      this.get('cmsItems').findBy('id', lock.get('id')).set('lockedBy', lock.get('email'));
    }, this);
  }.observes('lockedItems.@each'),

  actions: {
    deleteItem: function (item) {
      if (!window.confirm('Are you sure you want to remove ' + item.get('data.name') + '?')) {
        return;
      }

      var itemIndexController = this;

      var contentType = this.get('contentType');

      Ember.Logger.info('Attempting to delete `' + contentType.get('id') + ':' + item.get('id') + '`');

      // before we destroy this item, lets remove any reverse relationships pointing to it.

      Ember.Logger.info('Checking for reverse relations to update during item deletion.');

      var relatedKey = contentType.get('id') + ' ' + item.get('id');

      // we need to make sure the relation controlType is in the store so when we filter it happens immediately
      this.store.find('control-type', 'relation').then(function () {

        var relationControls = contentType.get('controls').filterBy('controlType.widget', 'relation');

        Ember.Logger.info('Found ' + relationControls.get('length') + ' relation control(s)');

        relationControls.forEach(function (control) {

          Ember.Logger.info('Updating reverse relations of `' + control.get('name') + '`');

          var relatedContentTypeId = control.get('meta.data.contentTypeId');
          var relatedControlName = control.get('meta.data.reverseName');
          var relatedItemIds = (item.get('data')[control.get('name')] || []).map(function (value) {
            return value.split(' ')[1];
          });

          Ember.Logger.info('`' + relatedContentTypeId + '` IDs', relatedItemIds.join(', '), 'need to be updated');

          // We have to get the contentType to get the itemModel.
          itemIndexController.store.find('content-type', relatedContentTypeId).then(function (relatedContentType) {
            var relatedItemModelName = getItemModelName(relatedContentType);

            relatedItemIds.forEach(function (relatedItemId) {
              itemIndexController.store.find(relatedItemModelName, relatedItemId).then(function (relatedItem) {
                var itemData = relatedItem.get('data');
                var updatedRelations = Ember.A([]);
                (relatedItem.get('data')[relatedControlName] || []).forEach(function (value) {
                  if (value !== relatedKey) {
                    updatedRelations.addObject(value);
                  }
                });
                itemData[relatedControlName] = updatedRelations.get('length') ? updatedRelations.toArray() : null;
                relatedItem.set('data', itemData);
                relatedItem.save().then(function () {
                  Ember.Logger.info('`' + relatedItemModelName + ':' + relatedItem.get('id') + '` updated.');
                });
              });
            });

          });

        });

      });

      window.ENV.deleteIndex(item.get('id'), this.get('contentType.id'));
      item.destroyRecord().then(function () {
        Ember.Logger.info('Item successfully destroyed.');
        window.ENV.sendBuildSignal();
        this.send('notify', 'success', 'Item removed!');
      }.bind(this));
    },

    toggleShowInCms: function (control) {
      control.toggleProperty('showInCms');
      this.get('contentType').save();
    },

    sortToggle: function (control) {

      this.get('cmsControls').setEach('isSortAscending', false);
      this.get('cmsControls').setEach('isSortDescending', false);

      var field = 'data.' + control.get('name');

      var sortProperties = this.get('sortProperties');

      if (sortProperties.get('firstObject') === field) {
        this.toggleProperty('sortAscending');
      } else {
        this.set('sortAscending', true);
      }

      control.set('isSortAscending', this.get('sortAscending'));
      control.set('isSortDescending', !this.get('sortAscending'));

      sortProperties.insertAt(0, field);
      sortProperties = sortProperties.uniq();

      Ember.Logger.info('Sorting by', sortProperties);

      this.set('sortProperties', sortProperties);

    },

    gotoEdit: function (contentTypeId, itemId) {
      this.transitionToRoute('wh.content.type.edit', contentTypeId, itemId);
    },

    moreRecords: function () {
      this.set('recordLimit', this.get('recordLimit') + this.get('originalRecordLimit'));
      this.set('content', this.store.find(this.get('itemModelName'), { limit: this.get('recordLimit') }));
    }
  }

});
