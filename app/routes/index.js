export default Ember.Route.extend({
  beforeModel: function () {

    var route = this;

    this.store.find('content-type').then(function (types) {
      if (types.get('length')) {
        route.transitionTo('wh');
      } else {
        route.transitionTo('start');
      }
    });
  }
});
