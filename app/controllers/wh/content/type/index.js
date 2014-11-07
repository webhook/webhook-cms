import getItemModelName from 'appkit/utils/model';
import SearchIndex from 'appkit/utils/search-index';

export default Ember.ArrayController.extend({
  sortProperties : ['itemData._sort_create_date'],
  sortAscending  : false,

  contentType: null,
  lockedItems: Ember.A([]),

  isSearchResults: false,

  recordLimit: 0,
  originalRecordLimit: 0,
  limited: function () {
    return this.get('content.length') >= this.get('recordLimit');
  }.property('content.@each', 'recordLimit'),

  filterQuery: '',

  columnChoices: function () {
    return this.get('contentType.controls').rejectBy('name', 'name').rejectBy('name', 'preview_url').rejectBy('name', 'instruction');
  }.property('contentType.controls.@each'),

  cmsControls: function () {
    var controls = this.get('contentType.controls').filterBy('showInCms');
    controls.forEach(function (control) {
      control.set('isSortable', control.get('controlType.valueType') === 'string');
    });
    return controls;
  }.property('contentType.controls.@each.showInCms'),

  _updateItemControls: function (item) {
    var cmsControls = Ember.A([]);
    this.get('cmsControls').forEach(function (control) {
      cmsControls.pushObject({
        value: item.get('itemData')[control.get('name')],
        controlType: control.get('controlType'),
        control: control
      });
    });
    item.set('cmsControls', cmsControls);
    return item;
  },

  cmsItems: Ember.arrayComputed('model.@each.itemData', 'cmsControls.@each.showInCms', {
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

  locksChanged: function () {
    this.get('cmsItems').setEach('lockedBy', null);
    this.get('lockedItems').forEach(function (lock) {
      this.get('cmsItems').findBy('id', lock.get('id')).set('lockedBy', lock.get('email'));
    }, this);
  }.observes('lockedItems.@each'),

  refreshContent: function () {
    this.set('isLoading', true);

    this.set('content', Ember.A([]));

    this.set('isSearchResults', false);

    var controller = this;
    this.store.find(this.get('itemModelName'), {
      limit: this.get('recordLimit'),
      orderBy: this.get('sortProperties.firstObject').replace('itemData.', ''),
      desc: !this.get('sortAscending')
    }).then(function (records) {
      controller.set('isLoading', false);
      controller.set('content', records);
    });
  },

  searchPlaceholder: function () {
    return 'Search ' + this.get('contentType.name');
  }.property('contentType'),

  debouncedSearchQueryObserver: Ember.debouncedObserver(function() {

    if (!this.get('searchQuery')) {
      this.refreshContent();
      return;
    }

    this.set('isLoading', true);
    this.set('content', Ember.A([]));

    var controller = this;

    SearchIndex.search(this.get('searchQuery'), 1, this.get('contentType.id')).then(function (results) {

      var records = results.getEach('id').map(function (recordId) {
        return controller.store.find(controller.get('itemModelName'), recordId);
      });

      Ember.RSVP.Promise.all(records).then(function (records) {
        controller.set('isLoading', false);
        records = records.sortBy(controller.get('sortProperties.firstObject'));
        if (!controller.get('sortAscending')) {
          records.reverse();
        }
        controller.set('content', records);
        controller.set('isSearchresults', true);
      });

    }, function (error) {
      controller.set('isLoading', false);
      controller.set('content', Ember.A([]));
    });

  }, 'searchQuery', 200),

  actions: {

    toggleShowInCms: function (control) {
      control.toggleProperty('showInCms');
      this.get('contentType').save();
    },

    sortToggle: function (control) {

      this.get('cmsControls').setEach('isSortAscending', false);
      this.get('cmsControls').setEach('isSortDescending', false);

      var orderBy = control.get('name');

      if (control.get('controlType.widget') === 'datetime') {
        orderBy = '_sort_' + control.get('name');
      }

      var sortProperties = this.get('sortProperties');

      if (sortProperties.get('firstObject').replace('itemData.', '') === orderBy) {
        this.toggleProperty('sortAscending');
      } else {
        this.set('sortAscending', true);
      }

      // this.set('orderBy', orderBy);
      sortProperties.insertAt(0, 'itemData.' + orderBy);
      this.set('sortProperties', sortProperties.uniq());

      control.set('isSortAscending', this.get('sortAscending'));
      control.set('isSortDescending', !this.get('sortAscending'));

      this.refreshContent();

    },

    gotoEdit: function (contentTypeId, itemId) {
      this.transitionToRoute('wh.content.type.edit', contentTypeId, itemId);
    },

    moreRecords: function () {
      this.set('recordLimit', this.get('recordLimit') + this.get('originalRecordLimit'));
      this.refreshContent();
    }
  }

});
