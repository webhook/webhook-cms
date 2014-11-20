export default Ember.Route.extend({

  beforeModel: function () {

    this._super.apply(this, arguments);

    // Check to see if site has been deployed
    if (!this.get('session.serverMessages.length')) {

      var route = this;
      var siteName = this.get('session.site.name');

      return new Ember.RSVP.Promise(function (resolve, reject) {

        window.ENV.firebaseRoot.child('management/sites/' + siteName + '/messages').limitToLast(10).once('value', function (snapshot) {

          snapshot.forEach(function (childSnapshot) {
            var message = Ember.$.extend({}, childSnapshot.val(), { id: childSnapshot.key() });
            if (typeof message.status !== 'undefined' && message.status === 0) {
              route.set('session.isDeployed', true);
            }
          });

          resolve();

        });

      });

    }

  },

  model: function () {
    return this.get('team.users');
  },

  setupController: function (controller) {
    controller.set('groups', this.get('team.groups'));
    controller.set('contentTypes', this.modelFor('wh'));

    this._super.apply(this, arguments);
  }
});
