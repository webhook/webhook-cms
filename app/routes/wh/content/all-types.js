export default Ember.Route.extend({
  beforeModel: function () {
    if (!this.modelFor('wh').get('length')) {
      this.transitionTo('wh.content.start');
    }
  },
  model: function () {
    return this.modelFor('wh');
  }
});
