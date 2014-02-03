export default Ember.ObjectController.extend({
  email: null,
  password: null,

  actions: {
    createUser: function () {
      this.get('session.auth').createUser(this.get('email'), this.get('password'), function(error, user) {
        if (!error) {
          window.console.log('User Id: ' + user.id + ', Email: ' + user.email);
        } else {
          window.console.log(error);
        }
      });
    },
    loginUser: function () {
      this.get('session.auth').login('password', {
        email: this.get('email'),
        password: this.get('password'),
        rememberMe: true
      });
    }
  }
});
