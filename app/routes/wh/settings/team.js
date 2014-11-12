export default Ember.Route.extend({

  ownerListener: null,
  userListener: null,
  potentialListener: null,

  setupController: function (controller) {

    var siteName = this.get('session.site.name');

    controller.setProperties({
      owners : [],
      users : [],
      potentialUsers: [],
      inviteEmail : '',
      isSending: false,
      success  : false,
      error    : null,
    });

    this.set('ownerListner', window.ENV.firebaseRoot.child("management/sites/" + siteName + "/owners").on('value', function(snapshot) {
      controller.set('owners', Ember.$.map(snapshot.val() || [], function(value, key) { return { email: value, key: key, owner: true }; } ));
    }));

    this.set('userListener', window.ENV.firebaseRoot.child("management/sites/" + siteName + "/users").on('value', function(snapshot) {
      controller.set('users', Ember.$.map(snapshot.val() || [], function(value, key) { return { email: value, key: key, user: true }; } ));
    }));

    this.set('potentialListener', window.ENV.firebaseRoot.child("management/sites/" + siteName + "/potential_users").on('value', function(snapshot) {
      controller.set('potentialUsers', Ember.$.map(snapshot.val() || [], function(value, key) { return { email: value, key: key, potential: true }; } ));
    }));


    // Check to see if site has been deployed
    if (!this.get('session.serverMessages.length')) {

      window.ENV.firebaseRoot.child('/management/sites/' + siteName + '/messages/').limitToLast(10).once('value', function (snapshot) {

        snapshot.forEach(function (childSnapshot) {
          var message = Ember.$.extend({}, childSnapshot.val(), { id: childSnapshot.key() });
          if (typeof message.status !== 'undefined' && message.status === 0) {
            controller.set('session.isDeployed', true);
          }
        });

      });

    }

    this._super.apply(this, arguments);
  },

  actions: {
    willTransition: function(transition) {
      var siteName = this.get('buildEnvironment').siteName;

      if(this.get('ownerListner')) {
        window.ENV.firebaseRoot.child("management/sites/" + siteName + "/owners").off('value', this.get('ownerListner'));
      }

      if(this.get('userListener')) {
        window.ENV.firebaseRoot.child("management/sites/" + siteName + "/users").off('value', this.get('userListener'));
      }

      if(this.get('potentialListener')) {
        window.ENV.firebaseRoot.child("management/sites/" + siteName + "/potential_users").off('value', this.get('potentialListener'));
      }

      return true;
    }
  }
});
