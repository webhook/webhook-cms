export default Ember.ArrayController.extend({
  type: null,
  cmsControls: null,

  controlsChanged: function () {

    this.set('cmsControls', this.get('contentType.controls').filterBy('showInCms'));

    this._updateItemControls();

  }.observes('contentType.controls.@each.showInCms'),

  contentChanged: function () {
    this._updateItemControls();
  }.observes('@each'),

  _updateItemControls: function () {

    this.get('content').forEach(function (item) {
      var cmsControls = Ember.A([]);
      this.get('cmsControls').forEach(function (control) {
        cmsControls.pushObject({
          value: item.get('data')[control.get('name')],
          controlType: control.get('controlType')
        });
      });
      item.set('cmsControls', cmsControls);
    }, this);

  },

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
