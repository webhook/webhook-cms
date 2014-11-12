export default Ember.Route.extend({
  model: function () {
    return this.store.find('redirect').then(function (redirects) {
      redirects.forEach(function (redirect, index) {
        redirect.set('priority', index);
      });
      return Ember.RSVP.Promise.resolve(redirects);
    });
  },
  setupController: function (controller) {

    var siteName = this.get('session.site.name');

    window.ENV.firebaseRoot.child("management/sites/" + siteName + "/dns").once('value', function(snapshot) {
      controller.set('domain', snapshot.val());
    });

    this._super.apply(this, arguments);

  }
});
