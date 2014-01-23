export default Ember.Route.extend({
  model: function () {
    // there has to be a better way to get the type. :(
    var path_parts = this.modelFor('wh.content.type').get('ref.path.m'),
        type = path_parts[path_parts.length - 1];
    return EmberFire.Object.create({
      ref: new Firebase(window.ENV.firebase + "content_types/" + type)
    });
  }
});
