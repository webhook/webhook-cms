export default Ember.Route.extend({
  beforeModel: function () {
    if (!this.modelFor('wh').get('length')) {
      this.transitionTo('wh.content.start');
    }

    // make sure all control types are available
    return this.store.find('control-type');
  },
  model: function () {
    return this.modelFor('wh');
  }
});
