export default Ember.Route.extend({
  model: function () {
    return this.modelFor('wh.content.type');
  },
  setupController: function (controller, model) {
    model.get('fields').setEach('value', null);
    this._super.apply(this, arguments);
  }
});
