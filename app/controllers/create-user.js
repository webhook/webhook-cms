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
        this.set('isSending', false);
      }.bind(this));
    }
  }
});
