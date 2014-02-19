export default Ember.Route.extend({
  setupController: function (controller) {
    controller.setProperties({
      themes: window.ENV.themes,
      isSending: false,
      success  : false,
      error    : null
    });
  }
});
