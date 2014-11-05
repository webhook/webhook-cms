export default Ember.Route.extend({
  beforeModel: function () {
    if (!this.get('buildEnvironment.local')) {
      this.transitionTo('wh');
    }
    this._super.apply(this, arguments);
  },
  setupController: function (controller) {
    controller.setProperties({
      themes: window.ENV.themes,
      isSending: false,
      success  : false,
      error    : null
    });
  }
});
