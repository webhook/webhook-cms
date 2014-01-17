export default Ember.Route.extend({
  model: function () {
    // there has to be a better way to get the type. :(
    var type = this.modelFor('content-type-test.type').get('ref.path.m').pop();
    return EmberFire.Array.create({
      ref: new Firebase(window.ENV.firebase + "data/" + type)
    });
  }
});
