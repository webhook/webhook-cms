export default Ember.ObjectController.extend({
  email    : null,
  password : "",
  password2: "",
  isSending: false,
  success  : false,
  error    : null,

  passwordMatches: function () {
    return this.get('password') === this.get('password2');
  }.property('password', 'password2'),

  actions: {
    createUser: function () {

      this.setProperties({
        success: false,
        error: null
      });

      if (!this.get('passwordMatches') || !this.get('password')) {
        return;
      }

      this.set('isSending', true);

      this.get('session.auth').createUser(this.get('email'), this.get('password'), function (error, user) {
        if (!error) {
          this.set('success', true);
        } else {
          this.set('error', error);
        }

        // Mark the user as existing, queue up confirmation email
        var token = user.token;
        var fireRoot = window.ENV.firebaseRoot;
        fireRoot.auth(token, function() {
          fireRoot.child('management/users/' + user.email.replace('.', ',1') + '/exists').set(true, function(err) {
            var data = {
              userid: user.email
            };

            if(!this.get('buildEnvironment').local) {
              data['siteref'] = document.location.hostname;
            }

            fireRoot.child('management/commands/verification/' + user.email.replace('.', ',1')).set(data, function(err) {
              fireRoot.unauth();
              this.set('isSending', false);
            }.bind(this));

          }.bind(this));
        }.bind(this));

      }.bind(this));
    }
  }
});
