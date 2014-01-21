export default Ember.Route.extend({
  model: function (params) {
    return EmberFire.Object.create({
      ref: new Firebase(window.ENV.firebase + "content_types/" + params.type)
    });
  }
});
