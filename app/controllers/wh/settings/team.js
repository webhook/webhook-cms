export default Ember.ArrayController.extend({

  sortProperties: ['email'],

  inviteEmail: '',

  isSending: false,
  success  : false,
  error    : null,

  emailRegex: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

  groupsRef: function () {
    return window.ENV.firebaseRoot.child('management/sites').child(this.get('session.site.name')).child('groups');
  }.property('session.site.name'),

  permissionsRef: function () {
    return window.ENV.firebaseRoot.child('management/sites').child(this.get('session.site.name')).child('permissions');
  }.property('session.site.name'),

  // we only want to show users that are 'owner', 'user', or 'potential'
  // set in the router
  filteredContent: function () {
    return this.get('arrangedContent').filterBy('isUser');
  }.property('arrangedContent.@each.isUser'),

  isInvalidEmail: function () {
    return !this.get('emailRegex').test(this.get('inviteEmail'));
  }.property('inviteEmail'),

  sendInviteSignal: function (inviteEmail) {
    var siteName = this.get('session.site.name');
    var currentEmail = this.get('session.user.email');

    function uniqueId() {
      return Date.now() + 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random()*16|0, v = c === 'x' ? r: (r&0x3|0x8);
        return v.toString(16);
      });
    }

    var data = {
      userid     : inviteEmail,
      from_userid: currentEmail,
      siteref    : siteName,
      id         : uniqueId()
    };

    window.ENV.firebaseRoot.child('management/commands/invite').push(data, function (err) {
      this.set('error', err);
    }.bind(this));
  },

  actions: {
    makeUser: function (user) {

      if (this.get('content').filterBy('owner').get('length') === 1) {
        this.set('error', { code: 'Need owner', message: 'Can\'t remove owner, need at least one owner.'});
        return;
      }

      var controller = this;

      // If they are on the owner list... they must be verified (unless they are the original owner, in which case.. whoops)
      var escapedEmail = user.key;
      var email = user.email;
      var siteName = this.get('session.site.name');

      window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/users/' + siteName).set(true, function (err) {
        window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/owners/' + siteName).set(null, function (err) {
          window.ENV.firebaseRoot.child('management/sites/' + siteName + '/users/' + escapedEmail).set(email, function (err) {

            if (err) {
              controller.set('error', err);
              return;
            }

            window.ENV.firebaseRoot.child('management/sites/' + siteName + '/owners/' + escapedEmail).remove(function (err) {
              if (err) {
                controller.set('error', err);
                return;
              }

              // Hey if this was you.. kick you out of this page now
              if (controller.get('session.user.email') === email) {
                controller.transitionToRoute('wh');
              }
            });

          });
        });
      });
    },

    makeOwner: function (user) {

      var controller = this;

      // If they are on the user list... they must be verified (unless they are the original owner, in which case.. whoops)
      var escapedEmail = user.key;
      var email = user.email;
      var siteName = this.get('session.site.name');

      window.ENV.firebaseRoot.child('management/sites/' + siteName + '/owners/' + escapedEmail).set(email, function (err) {

        if (err) {
          controller.set('error', err);
          return;
        }

        window.ENV.firebaseRoot.child('management/sites/' + siteName + '/users/' + escapedEmail).remove(function (err) {

          if (err) {
            controller.set('error', err);
            return;
          }

          // Update your user list
          window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/users/' + siteName).set(null, function (err) {
            window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/owners/' + siteName).set(true, function (err) {
            });
          });
        });
      });
    },

    removeUser: function (user) {

      if (this.get('content').get('length') === 1) {
        this.set('error', { code: 'Need owner', message: 'Can\'t remove owner, need at least one owner.'});
        return;
      }

      var controller = this;

      var escapedEmail = user.key;
      var email = user.email;
      var siteName = this.get('session.site.name');

      window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/owners/' + siteName).set(null, function (err) {
        window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/users/' + siteName).set(null, function (err) {
          window.ENV.firebaseRoot.child('management/sites/' + siteName + '/users/' + escapedEmail).remove(function (err) {
            if (err) {
              controller.set('error', err);
              return;
            }

            window.ENV.firebaseRoot.child('management/sites/' + siteName + '/owners/' + escapedEmail).set(null, function (err) {
              if (err) {
                controller.set('error', err);
                return;
              }

              // removed self, log out.
              if (controller.get('session.user.email') === email) {
                controller.get('session.auth.auth').logout();
              }
            });
          });
        });
      });
    },

    removePotential: function (user) {

      var controller = this;

      var escapedEmail = user.key;
      var email = user.email;
      var siteName = this.get('session.site.name');

      window.ENV.firebaseRoot.child('management/sites/' + siteName + '/potential_users/' + escapedEmail).set(null, function (err) {
        if (err) {
          controller.set('error', err);
        }
      });
    },

    sendInvite: function () {

      var controller = this;

      this.set('error', null);

      if (this.get('isInvalidEmail')) {
        this.set('error', { message: 'This is an invalid email address.', code: 'Error' });
        return;
      }

      var email = this.get('inviteEmail');

      // Make sure they arent already on the list
      if (this.get('content').isAny('email', email)) {
        this.set('error', { message: 'This person has already been invited to your site.', code: 'Error' });
        this.set('inviteEmail', '');
        return;
      }

      var escapedEmail = email.replace(/\./g, ',1');
      var siteName = this.get('session.site.name');

      window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/verification/verified').once('value', function (snapshot) {
        var value = snapshot.val();

        if (!value && !window.ENV.selfHosted) { // Not a verified email, add to the potential user list
          window.ENV.firebaseRoot.child('management/sites/' + siteName + '/potential_users/' + escapedEmail).set(email, function (err) {
            if (err) {
              controller.set('error', err);
              return;
            }
            controller.sendInviteSignal(email);
          });
        } else {   // Verified user, add to the real users list
          window.ENV.firebaseRoot.child('management/sites/' + siteName + '/users/' + escapedEmail).set(email, function (err) {
            if (err) {
              controller.set('error', err);
              return;
            }
            window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/users/' + siteName).set(true, function (err) {
              controller.sendInviteSignal(email);
            });
          });
        }

      }, function (err) {
        if (err) {
          controller.set('error', err);
          return;
        }
      });

      this.set('inviteEmail', '');
    },

    openGroup: function (group) {
      group.set('isOpen', true);
    },

    closeGroup: function (group) {
      group.set('isOpen', false);
    },

    userToGroup: function (user, group) {

      // window.console.log(user.group.get('key'));

      if (user.group) {
        this.get('groupsRef').child(user.group.get('key')).child('users').child(user.get('key')).remove();
      }

      if (group === 'owner') {

      } else if (group === 'user') {

      } else if (typeof group === 'object') {
        this.get('groupsRef').child(group.get('key')).child('users').child(user.get('key')).set(true);
      }

    },

    createGroup: function (groupName) {
      if (typeof groupName !== 'string' || Ember.isEmpty(groupName)) {
        return;
      }

      var siteName = this.get('session.site.name');
      var escapedGroupName = groupName.replace(/\./g, ',1').replace(/\#/g, ',2').replace(/\$/g, ',3').replace(/\[/g, ',5').replace(/\]/g, ',5');
      this.get('groupsRef').child(escapedGroupName).child('name').set(groupName);
    },

    changePermission: function (group, contentType, permission) {
      var permissions = ['view', 'draft', 'publish', 'delete'];
      var siteName = this.get('session.site.name');
      var currentPermission = group.get('permissions').get(contentType.get('id'));

      // If you select the current permission, bump down one level
      if (permission === currentPermission) {
        permission = permissions[permissions.indexOf(permission) - 1] || null;
      }

      this.get('groupsRef').child(group.get('key')).child('permissions').child(contentType.get('id')).set(permission);

    }
  }
});
