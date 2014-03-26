export default Ember.Route.extend({

  setupController: function (controller) {
    controller.setProperties({
      isLoading: true
    });

    this._super.apply(this, arguments);
  },
});
