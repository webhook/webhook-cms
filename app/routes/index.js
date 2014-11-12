export default Ember.Route.extend({
  beforeModel: function () {

    this._super.apply(this, arguments);

    if (Ember.isEmpty(this.get('session.user'))) {
      return;
    }

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
