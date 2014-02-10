export default Ember.ObjectController.extend({
  email    : null,
  isSending: false,
  success  : false,
  error    : null,

  actions: {
    resendEmail: function () {

      this.setProperties({
        success: false,
        error: null
      });

      this.set('isSending', true);

      var escapedEmail = this.get('email').replace('.', ',1');
      var root = window.ENV.firebaseRoot.child('management/commands/verification/' + escapedEmail);

      root.set({ userid: this.get('email'), siteref: window.location.host }, function(err) {

        if(err) {
          this.set('error', err);
          return;
        } else {
          this.set('success', { message: 'Verification e-mail resent' });
        }

        this.set('isSending', false);
      }.bind(this));
    }
  }
});
