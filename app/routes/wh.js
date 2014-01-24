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
      ref: this.get('ref'),
      newType: this.get('store').createRecord('contentType')
    });

    this._super.apply(this, arguments);
  }
});

