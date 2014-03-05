export default Ember.ObjectController.extend({
  owners : [],
  users : [],
  potentialUsers: [],

  inviteEmail : '',

  isSending: false,
  success  : false,
  error    : null,

  allUsers: function () {
    var combined = [];
    combined = Ember.$.merge(combined, this.get('owners'));
    combined = Ember.$.merge(combined, this.get('users'));
    combined = Ember.$.merge(combined, this.get('potentialUsers'));

    combined.sort(function(a, b){
        if(a.email < b.email) return -1;
        if(a.email > b.email) return 1;
        return 0;
    });

    var cleaned = [];

    var prev = null;
    combined.forEach(function(item) {
      if(!(prev && prev.email === item.email)) {
        cleaned.push(item);
        prev = item;
      }
    });

    return cleaned;
  }.property('owners', 'users', 'potentialUsers'),


  actions: {
    makeUser : function(user) {
      // If they are on the owner list... they must be verified (unless they are the original owner, in which case.. whoops)
      var escapedEmail = user.key;
      var email = user.email;
      var siteName = this.get('buildEnvironment').siteName;

      window.ENV.firebaseRoot.child('management/sites/' + siteName + '/users/' + escapedEmail).set(email, function() {
        window.ENV.firebaseRoot.child('management/sites/' + siteName + '/owners/' + escapedEmail).remove();
      });

      // Send email to user
    },
    makeOwner : function(user) {
      // If they are on the user list... they must be verified (unless they are the original owner, in which case.. whoops)
      var escapedEmail = user.key;
      var email = user.email;
      var siteName = this.get('buildEnvironment').siteName;

      window.ENV.firebaseRoot.child('management/sites/' + siteName + '/owners/' + escapedEmail).set(email, function() {
        window.ENV.firebaseRoot.child('management/sites/' + siteName + '/users/' + escapedEmail).remove();
      });

      // Send email to user
    },

    removeUser: function(user) {
      var escapedEmail = user.key;
      var email = user.email;
      var siteName = this.get('buildEnvironment').siteName;

      window.ENV.firebaseRoot.child('management/sites/' + siteName + '/owners/' + escapedEmail).set(null, function() {
        window.ENV.firebaseRoot.child('management/sites/' + siteName + '/users/' + escapedEmail).remove();
      });
    },

    removePotential: function(user) {
      var escapedEmail = user.key;
      var email = user.email;
      var siteName = this.get('buildEnvironment').siteName;

      window.ENV.firebaseRoot.child('management/sites/' + siteName + '/potential_users/' + escapedEmail).set(null, function() {
      });
    },

    sendInvite: function() {
      var email = this.get('inviteEmail');
      var escapedEmail = email.replace(/\./g, ',1');
      var siteName = this.get('buildEnvironment').siteName;

      // Should probably do... some level of veriication here?

      // Also we need to make sure they arent already on the list...

      window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/verification/verified').once('value', function(snapshot) {
        var value = snapshot.val();

        if(!value) // Not a verified email, add to the potential user list
        {
          window.ENV.firebaseRoot.child('management/sites/' + siteName + '/potential_users/' + escapedEmail).set(email, function() {
          });
        } else {   // Verified user, add to the real users list
          window.ENV.firebaseRoot.child('management/sites/' + siteName + '/users/' + escapedEmail).set(email, function() {
          });
        }

        // Either way send a signal to build environment to send email
      });

      this.set('inviteEmail', '');
    },
  }
});
