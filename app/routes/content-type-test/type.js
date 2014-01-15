export default Ember.Route.extend({
  model: function (params) {
    return EmberFire.Object.create({
      ref: new Firebase(window.ENV.firebase + "content_types/" + params.id)
    });
  },
  setupController: function (controller, model) {
    this._super.apply(this, arguments);
  }
});
