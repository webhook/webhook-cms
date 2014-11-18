export default Ember.Route.extend({

  init: function () {

    var siteName = this.get('session.site.name');
    var managementRef = window.ENV.firebaseRoot.child('management/sites/' + siteName);

    var users = Ember.A([]);

    var findOrCreateUser = function (snapshot) {
      var user = users.findBy('key', snapshot.key());

      if (Ember.isEmpty(user)) {
        user = Ember.Object.create({
          key  : snapshot.key(),
          email: snapshot.val()
        });
        user.reopen({
          isUser: function () {
            return this.get('owner') || this.get('user') || this.get('potential');
          }.property('owner', 'user', 'potential')
        });
        users.pushObject(user);
      }

      return user;
    };

    managementRef.child('owners').on('child_removed', function (snapshot) {
      findOrCreateUser(snapshot).set('owner', false);
    });
    managementRef.child('owners').on('child_added', function (snapshot) {
      findOrCreateUser(snapshot)
        .set('owner', true)
        .set('user', false)
        .set('potential', false);
    });

    managementRef.child('users').on('child_removed', function (snapshot) {
      findOrCreateUser(snapshot).set('user', false);
    });
    managementRef.child('users').on('child_added', function (snapshot) {
      findOrCreateUser(snapshot)
        .set('owner', false)
        .set('user', true)
        .set('potential', false);
    });

    managementRef.child('potential_users').on('child_removed', function (snapshot) {
      findOrCreateUser(snapshot).set('potential', false);
    });
    managementRef.child('potential_users').on('child_added', function (snapshot) {
      findOrCreateUser(snapshot)
        .set('owner', false)
        .set('user', false)
        .set('potential', true);
    });

    this.set('users', users);

  },

  beforeModel: function () {

    this._super.apply(this, arguments);

    // Check to see if site has been deployed
    if (!this.get('session.serverMessages.length')) {

      var route = this;
      var siteName = this.get('session.site.name');

      return new Ember.RSVP.Promise(function (resolve, reject) {

        window.ENV.firebaseRoot.child('/management/sites/' + siteName + '/messages/').limitToLast(10).once('value', function (snapshot) {

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
    return this.get('users');
  }
});
