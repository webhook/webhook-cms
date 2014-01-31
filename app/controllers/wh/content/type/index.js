export default Ember.ArrayController.extend({
  type: null,
  cmsControlNames: Ember.A([]),

  controlsChanged: function () {

    this.set('cmsControlNames', Ember.A([]));

    this.get('contentType.controls').filterBy('showInCms').forEach(function (control) {
      this.get('cmsControlNames').pushObject(control.get('name'));
    }, this);

    // Need controlTypes in store for save later.
    this.get('contentType.controls').mapBy('controlType');

    this._updateItemControls();

  }.observes('contentType.controls.@each.showInCms'),

  contentChanged: function () {
    this._updateItemControls();
  }.observes('@each'),

  _updateItemControls: function () {

    this.get('content').forEach(function (item) {
      var controlValues = [];
      this.get('cmsControlNames').forEach(function (name) {
        controlValues.push(item.get('data')[name]);
      });
      item.set('controls', controlValues);
    }, this);

  },

  actions: {
    deleteItem: function (item) {
      item.destroyRecord();
    },
    toggleShowInCms: function (control) {
      control.toggleProperty('showInCms');
      this.get('contentType').save();
    }
  }

});
