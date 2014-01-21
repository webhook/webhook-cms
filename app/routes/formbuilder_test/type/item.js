export default Ember.Route.extend({
  model: function (params) {
    // there has to be a better way to get the type. :(
    var type = this.modelFor('formbuilder_test.type').get('ref.path.m').pop();
    return EmberFire.Object.create({
      ref: new Firebase(window.ENV.firebase + "content_types/" + type)
    });
  }
});
