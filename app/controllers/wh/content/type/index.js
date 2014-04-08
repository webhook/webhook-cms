export default Ember.ArrayController.extend({
  sortProperties : ['data.publish_date'],
  sortAscending  : false,
  sortedByPublish: true,

  contentType: null,
  cmsControls: null,
  lockedItems: Ember.A([]),

  filterQuery: '',

  _updateItemControls: function (item) {
    var cmsControls = Ember.A([]);
    this.get('cmsControls').filterBy('showInCms').forEach(function (control) {
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

    var sortedCmsItems = this.get('cmsItems').filter(function (item) {
      if (!filterQuery) {
        return true;
      } else {
        return (new RegExp(filterQuery, 'ig')).test(item.get('data.name'));
      }
    });

    sortedCmsItems = sortedCmsItems.sortBy.apply(this, this.get('sortProperties'));

    if (!this.get('sortAscending')) {
      sortedCmsItems.reverse();
    }

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
      var id = item.get('id');
      item.destroyRecord().then(function () {
        window.ENV.sendBuildSignal();
        window.ENV.deleteIndex(id, this.get('contentType.id'));
        this.send('notify', 'success', 'Item removed!');
      }.bind(this));
    },

    toggleShowInCms: function (control) {
      control.toggleProperty('showInCms');
      this.get('contentType').save();
    },

    sortToggle: function (field) {

      field = 'data.' + field;

      var sortProperties = this.get('sortProperties');

      if (sortProperties.get('firstObject') === field) {
        this.toggleProperty('sortAscending');
      } else {
        this.set('sortAscending', true);
      }

      sortProperties.insertAt(0, field);
      sortProperties = sortProperties.uniq();

      this.set('sortProperties', sortProperties);

      window.console.log(this.get('sortAscending'), this.get('sortProperties'));

    }
  }

});
