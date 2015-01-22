export default Ember.Route.extend({

  beforeModel: function () {
    var route = this;

    return this.store.find('settings', 'general').then(function (settings) {
      route.set('settings', settings);
    }, function (error) {
      var settings = route.store.getById('settings', 'general');
      settings.loadedData();
      route.set('settings', settings);
    });

  },

  setupController: function (controller) {

    this._super.apply(this, arguments);

    controller.set('contentTypes', this.modelFor('wh'));
    controller.set('settings', this.get('settings'));
  }
});
