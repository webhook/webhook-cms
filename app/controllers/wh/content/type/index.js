export default Ember.ArrayController.extend({
  contentType: null,
  cmsControls: null,

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

  actions: {
    deleteItem: function (item) {
      item.destroyRecord().then(function () {
        window.ENV.sendBuildSignal();
      }.bind(this));
    },
    toggleShowInCms: function (control) {
      control.toggleProperty('showInCms');
      this.get('contentType').save();
    }
  }

});
