export default Ember.Route.extend({
  beforeModel: function () {
    var route = this;
    return this.store.find('settings', 'general').then(function (settings) {
      route.set('generalSettings', settings);
    });
  },
  setupController: function (controller) {

    this._super.apply(this, arguments);

    controller.set('contentTypes', this.modelFor('wh'));
    controller.set('generalSettings', this.get('generalSettings'));
  }
});
