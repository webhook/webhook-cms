export default Ember.Route.extend({
  beforeModel: function () {
    this.store.find('content-type').then(function (types) {
      if (types.get('length')) {
        this.transitionTo('wh.content');
      } else {
        this.transitionTo('start');
      }
    }.bind(this));
  }
});
