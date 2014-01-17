export default Ember.Route.extend({
  model: function (params) {
    window.console.log('type', params);
    return EmberFire.Object.create({
      ref: new Firebase(window.ENV.firebase + "content_types/" + params.type)
    });
  }
});
