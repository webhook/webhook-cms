export default Ember.Route.extend({

  setupController: function (controller) {

    var siteName = this.get('session.site.name');

    controller.setProperties({
      domain : "",
      isSending: false,
      success  : false,
      errors   : Ember.A([]),
    });

    window.ENV.firebaseRoot.child("management/sites/" + siteName + "/dns").once('value', function(snapshot) {
      controller.set('domain', snapshot.val());
    });

    this._super.apply(this, arguments);
  },
});
