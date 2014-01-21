export default Ember.Route.extend({
  init: function () {
    this.set('ref', new Firebase(window.ENV.firebase + "content_types"));
  },
  model: function () {
    return EmberFire.Array.create({
      ref: this.get('ref')
    });
  },
  setupController: function (controller, model) {
    controller.setProperties({
      model: model,
      ref: this.get('ref'),
      contentType: this.get('store').createRecord('contentType')
    });
  }
});
