export default Ember.ObjectController.extend({
  owners : [],
  users : [],
  potentialUsers: [],

  inviteEmail : '',

  isSending: false,
  success  : false,
  error    : null,

  emailRegex: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

  isInvalidEmail: function () {
    return !this.get('emailRegex').test(this.get('inviteEmail'));
  }.property('inviteEmail'),

  sendInviteSignal: function(inviteEmail) {
    var siteName = this.get('session.site.name');
    var currentEmail = this.get('session.user.email');


    function uniqueId() {
      return Date.now() + 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
    }

    var data = {
      userid: inviteEmail,
      from_userid: currentEmail,
      siteref: siteName,
      id: uniqueId()
    };

    window.ENV.firebaseRoot.child('management/commands/invite').push(data, function(err) {
      this.set('error', err);
    }.bind(this));
  },

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
      var siteName = this.get('session.site.name');

      if (user.owner && this.get('owners.length') === 1) {
        this.set('error', { code: 'Need owner', message: 'Can\'t remove owner, need at least one owner.'});
        return;
      }

      window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/users/' + siteName).set(true, function(err) {
        window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/owners/' + siteName).set(null, function(err) {
          window.ENV.firebaseRoot.child('management/sites/' + siteName + '/users/' + escapedEmail).set(email, function(err) {

            if(err) {
              this.set('error', err);
              return;
            }

            window.ENV.firebaseRoot.child('management/sites/' + siteName + '/owners/' + escapedEmail).remove(function(err) {
              if(err) {
                this.set('error', err);
                return;
              }

              // Hey if this was you.. kick you out of this page now
              if(this.get('session.user.email') === email) {
                this.transitionToRoute('wh');
              }
            }.bind(this));

          }.bind(this));
        }.bind(this));
      }.bind(this));
    },
    makeOwner : function(user) {
      // If they are on the user list... they must be verified (unless they are the original owner, in which case.. whoops)
      var escapedEmail = user.key;
      var email = user.email;
      var siteName = this.get('session.site.name');

      window.ENV.firebaseRoot.child('management/sites/' + siteName + '/owners/' + escapedEmail).set(email, function(err) {

        if(err) {
          this.set('error', err);
          return;
        }

        window.ENV.firebaseRoot.child('management/sites/' + siteName + '/users/' + escapedEmail).remove(function(err) {

          if(err) {
            this.set('error', err);
            return;
          }

          // Update your user list
          window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/users/' + siteName).set(null, function(err) {
            window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/owners/' + siteName).set(true, function(err) {
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    },

    removeUser: function(user) {
      var escapedEmail = user.key;
      var email = user.email;
      var siteName = this.get('session.site.name');

      if (user.owner && this.get('owners.length') === 1) {
        this.set('error', { code: 'Need owner', message: 'Can\'t remove owner, need at least one owner.'});
        return;
      }

      window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/owners/' + siteName).set(null, function(err) {
        window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/users/' + siteName).set(null, function(err) {
          window.ENV.firebaseRoot.child('management/sites/' + siteName + '/users/' + escapedEmail).remove(function(err) {
            if(err) {
              this.set('error', err);
              return;
            }

            window.ENV.firebaseRoot.child('management/sites/' + siteName + '/owners/' + escapedEmail).set(null, function(err) {
              if(err) {
                this.set('error', err);
                return;
              }

              if(this.get('session.user.email') === email) {
                this.get('session').get('auth').logout();
              }
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    },

    removePotential: function(user) {
      var escapedEmail = user.key;
      var email = user.email;
      var siteName = this.get('session.site.name');

      window.ENV.firebaseRoot.child('management/sites/' + siteName + '/potential_users/' + escapedEmail).set(null, function(err) {
        if(err) {
          this.set('error', err);
          return;
        }
      }.bind(this));
    },

    sendInvite: function() {
      var email = this.get('inviteEmail');

      this.set('error', null);

      if (this.get('isInvalidEmail')) {
        this.set('error', { message: 'This is an invalid email address.', code: 'Error' });
        return;
      }

      var escapedEmail = email.replace(/\./g, ',1');
      var siteName = this.get('session.site.name');

      // Make sure they arent already on the list
      var inList = false;

      this.get('allUsers').forEach(function(user) {
        if(user.email === email) {
          inList = true;
        }
      });

      if(inList) {
        this.set('error', { message: 'This person has already been invited to your site.', code: 'Error' });
        this.set('inviteEmail', '');
        return;
      }

      window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/verification/verified').once('value', function(snapshot) {
        var value = snapshot.val();

        if(!value && !window.ENV.selfHosted) // Not a verified email, add to the potential user list
        {
          window.ENV.firebaseRoot.child('management/sites/' + siteName + '/potential_users/' + escapedEmail).set(email, function(err) {
            if(err) {
              this.set('error', err);
              return;
            }
            this.sendInviteSignal(email);
          }.bind(this));
        } else {   // Verified user, add to the real users list
          window.ENV.firebaseRoot.child('management/sites/' + siteName + '/users/' + escapedEmail).set(email, function(err) {
            if(err) {
              this.set('error', err);
              return;
            }
            window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/users/' + siteName).set(true, function(err) {
              this.sendInviteSignal(email);
            }.bind(this));
          }.bind(this));
        }

      }.bind(this), function(err) {
        if(err) {
          this.set('error', err);
          return;
        }
      }.bind(this));

      this.set('inviteEmail', '');
    },
  }
});
