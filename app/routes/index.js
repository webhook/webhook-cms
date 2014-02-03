export default Ember.Route.extend({
  setupController: function (controller) {
    controller.setProperties({
      email: null,
      password: null
    });
  }
});
