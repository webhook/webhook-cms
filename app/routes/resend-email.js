export default Ember.Route.extend({
  setupController: function (controller) {
    controller.setProperties({
      email    : null,
      isSending: false,
      success  : false,
      error    : null
    });
  }
});
