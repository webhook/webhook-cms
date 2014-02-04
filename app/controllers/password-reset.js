export default Ember.ObjectController.extend({
  email: null,
  isSending: false,
  success: false,
  error: null,

  actions: {
    resetPassword: function () {

      this.set('isSending', true);
      this.set('success', false);
      this.set('error', null);

      this.get('session.auth').sendPasswordResetEmail(this.get('email'), function (error, success) {
        if (!error) {
          this.set('success', true);
        } else {
          this.set('error', error);
        }
        this.set('isSending', false);
      }.bind(this));

    }
  }
});
