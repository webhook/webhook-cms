export default Ember.Route.extend({
  setupController: function (controller) {
    controller.setProperties({
      email    : null,
      password : "",
      password2: "",
      isSending: false,
      success  : false,
      error    : null
    });
  }
});
