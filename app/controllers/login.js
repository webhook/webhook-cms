export default Ember.ObjectController.extend({
  email: null,
  password: null,

  actions: {
    loginUser: function () {
      this.get('session.auth').login('password', {
        email: this.get('email'),
        password: this.get('password'),
        rememberMe: true
      });
    }
  }
});
