export default Ember.Route.extend({
  setupController: function (controller) {

    this._super.apply(this, arguments);

    controller.set('contentTypes', this.modelFor('wh'));
  }
});
