export default Ember.ArrayController.extend({

  sortProperties: ['email'],

  inviteEmail: '',

  isSending: false,
  success  : false,
  error    : null,

  emailRegex: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

  // we only want to show users that are 'owner', 'user', or 'potential'
  // set in the router
  filteredContent: function () {
    return this.get('arrangedContent').filterBy('isUser');
  }.property('arrangedContent.@each.isUser'),

  managementRef: function () {
    return window.ENV.firebaseRoot.child('management/sites').child(this.get('session.site.name'));
  }.property(),

  groupsRef: function () {
    return this.get('managementRef').child('groups');
  }.property(),

  permissionsRef: function () {
    return this.get('managementRef').child('permissions');
  }.property(),

  ownersRef: function () {
    return this.get('managementRef').child('owners');
  }.property(),

  usersRef: function () {
    return this.get('managementRef').child('users');
  }.property(),

  potentialsRef: function () {
    return this.get('managementRef').child('potentials');
  }.property(),

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

      // unverified users are stuck
      if (user.get('potential')) {
        return;
      }

      if (this.get('content').filterBy('owner').get('length') === 1) {
        this.set('error', { code: 'Need owner', message: 'Can\'t remove owner, need at least one owner.'});
        return;
      }

      var controller = this;

      // If they are on the owner list... they must be verified (unless they are the original owner, in which case.. whoops)
      var escapedEmail = user.key;
      var email = user.email;
      var siteName = this.get('session.site.name');

      controller.get('usersRef').child(escapedEmail).set(email, function (err) {
        if (err) {
          controller.set('error', err);
          return;
        }
        controller.get('ownersRef').child(escapedEmail).remove(function (err) {
          if (err) {
            controller.set('error', err);
            return;
          }

          // Hey if this was you.. kick you out of this page now
          if (controller.get('session.user.email') === email) {
            controller.transitionToRoute('wh');
          }

          // Update your user list
          window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/users/' + siteName).set(true);
          window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/owners/' + siteName).remove();
        });

      });
    },

    makeOwner: function (user) {

      // unverified users are stuck
      if (user.get('potential')) {
        return;
      }

      var controller = this;

      // If they are on the user list... they must be verified (unless they are the original owner, in which case.. whoops)
      var escapedEmail = user.key;
      var email = user.email;
      var siteName = this.get('session.site.name');

      controller.get('ownersRef').child(escapedEmail).set(email, function (err) {
        if (err) {
          controller.set('error', err);
          return;
        }
        controller.get('usersRef').child(escapedEmail).remove(function (err) {
          if (err) {
            controller.set('error', err);
            return;
          }

          // Update your user list
          window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/users/' + siteName).remove();
          window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/owners/' + siteName).set(true);
        });
      });
    },

    removeUser: function (user) {

      if (this.get('content').get('length') === 1) {
        this.set('error', { code: 'Need owner', message: 'Can\'t remove owner, need at least one owner.'});
        return;
      }

      if (user.get('group')) {
        this.get('groupsRef').child(user.group.get('key')).child('users').child(user.get('key')).remove();
      }

      var controller = this;

      var escapedEmail = user.key;
      var email = user.email;
      var siteName = this.get('session.site.name');

      controller.get('usersRef').child(escapedEmail).remove(function (err) {
        if (err) {
          controller.set('error', err);
          return;
        }

        controller.get('ownersRef').child(escapedEmail).remove(function (err) {
          if (err) {
            controller.set('error', err);
            return;
          }

          // removed self, log out.
          if (controller.get('session.user.email') === email) {
            controller.get('session.auth.auth').logout();
          }

          // Update your user list
          window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/owners/' + siteName).remove();
          window.ENV.firebaseRoot.child('management/users/' + escapedEmail + '/sites/users/' + siteName).remove();

        });
      });
    },

    removePotential: function (user) {

      if (user.get('group')) {
        this.get('groupsRef').child(user.group.get('key')).child('users').child(user.get('key')).remove();
      }

      var controller = this;

      controller.get('potentialsRef').child(user.key).remove(function (err) {
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

      if (user.get('group')) {
        this.get('groupsRef').child(user.group.get('key')).child('users').child(user.get('key')).remove();
      }

      if (user.get('owner') && group !== 'owner' && !window.confirm('Moving an owner to another group will reduce permissions.')) {
        return;
      }

      if (group === 'owner') {
        this.send('makeOwner', user);
      } else if (group === 'user') {
        this.send('makeUser', user);
      } else if (typeof group === 'object') {
        this.send('makeUser', user);
        this.get('groupsRef').child(group.get('key')).child('users').child(user.get('key')).set(true);
      }

    },

    createGroup: function (groupName) {
      if (typeof groupName !== 'string' || Ember.isEmpty(groupName)) {
        return;
      }

      var siteName = this.get('session.site.name');
      var escapedGroupName = groupName.replace(/\./g, ',1').replace(/\#/g, ',2').replace(/\$/g, ',3').replace(/\[/g, ',5').replace(/\]/g, ',5');

      // default permissions are 'none'
      var contentTypePermissions = {};
      this.get('contentTypes').forEach(function (contentType) {
        contentTypePermissions[contentType.get('id')] = 'none';
      });

      this.get('groupsRef').child(escapedGroupName).set({
        name: groupName,
        permissions: contentTypePermissions
      });
    },

    deleteGroup: function (group) {
      if (!window.confirm('Are you sure you want to remove %@? All users in this group will become editors.'.fmt(group.get('name')))) {
        return;
      }
      this.get('groupsRef').child(group.get('key')).remove();
    },

    changePermission: function (group, contentType, permission) {
      var permissions = ['view', 'draft', 'publish', 'delete'];
      var siteName = this.get('session.site.name');
      var currentPermission = group.get('permissions').get(contentType.get('id'));

      // If you select the current permission, bump down one level
      if (permission === currentPermission) {
        if (contentType.get('oneOff') && permission === 'publish') {
          permission = 'view';
        } else {
          permission = permissions[permissions.indexOf(permission) - 1] || 'none';
        }
      }

      this.get('groupsRef').child(group.get('key')).child('permissions').child(contentType.get('id')).set(permission);

    }
  }
});
