export default Ember.Route.extend({
  beforeModel: function () {
    if (!this.get('buildEnvironment.local')) {
      this.transitionTo('wh');
    }
    this._super.apply(this, arguments);
  }
});
