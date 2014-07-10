export default Ember.Route.extend({
  setupController: function (controller) {
    controller.setProperties({
      email: 'demo@webhook.com',
      password: 'demo'
    });
  }
});
