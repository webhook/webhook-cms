export default Ember.ObjectController.extend({
  oldPassword : "",
  newPassword : "",
  newPassword2: "",

  isLoading: false,
  success  : false,
  errors   : Ember.A([]),

  isValid: false,

  reset: function () {
    this.setProperties({
      isValid     : false,
      isLoading   : false,
      success     : false,
      errors      : Ember.A([]),
      oldPassword : "",
      newPassword : "",
      newPassword2: "",
    });
  },

  passwordMatches: function () {
    return this.get('newPassword') === this.get('newPassword2');
  }.property('newPassword', 'newPassword2'),

  validateInput: function () {

    this.set('isValid', true);
    this.get('errors').clear();

    if (!this.get('passwordMatches')) {
      this.set('isValid', false);
      this.get('errors').pushObject('New passwords need to match.');
    }

    if (!this.get('oldPassword')) {
      this.set('isValid', false);
      this.get('errors').pushObject('Old password is missing.');
    }

    if (!this.get('newPassword')) {
      this.set('isValid', false);
      this.get('errors').pushObject('New password is missing.');
    }

  },

  actions: {
    changePassword: function () {

      this.set('success', false);

      this.validateInput();

      if (!this.get('isValid')) {
        return;
      }

      this.set('isLoading', true);

      var email = this.get('session.user.email'),
          oldPassword = this.get('oldPassword'),
          newPassword = this.get('newPassword');

      this.get('session.auth').changePassword(email, oldPassword, newPassword, function (error, success) {
        this.set('isLoading', false);

        if (success) {
          this.set('success', {
            message: 'Password successfully changed'
          });
        }

        if (error) {
          this.set('errors', Ember.A([error]));
        }
      }.bind(this));

    }
  }
});
