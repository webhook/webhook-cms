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

      function uniqueId() {
        return Date.now() + 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
        }); 
      }

      var escapedEmail = this.get('email').replace(/\./g, ',1');
      var root = window.ENV.firebaseRoot.child('management/commands/verification/' + escapedEmail);

      root.set({ userid: this.get('email'), siteref: window.location.host, id: uniqueId() }, function(err) {

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
