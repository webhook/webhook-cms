export default Ember.ArrayController.extend({
  contentType: null,
  cmsControls: null,
  lockedItems: Ember.A([]),

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

  locksChanged: function () {
    this.get('cmsItems').setEach('lockedBy', null);
    this.get('lockedItems').forEach(function (lock) {
      this.get('cmsItems').findBy('id', lock.get('id')).set('lockedBy', lock.get('email'));
    }, this);
  }.observes('lockedItems.@each'),

  actions: {
    deleteItem: function (item) {
      item.destroyRecord().then(function () {
        window.ENV.sendBuildSignal();
        this.send('notify', 'success', 'Item removed!');
      }.bind(this));
    },
    toggleShowInCms: function (control) {
      control.toggleProperty('showInCms');

      this.get('contentType.controls').forEach(function (control) {
        // hax
        // firebase doesn't like undefined values and for some reason `_super` is
        // being added to arrays in ember with undefined value
        if (Ember.isArray(control.get('meta.data.options'))) {
          delete control.get('meta.data.options')._super;
        }
      });

      this.get('contentType').save();
    }
  }

});
