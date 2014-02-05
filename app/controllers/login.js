export default Ember.ObjectController.extend({
  email: null,
  password: null,
  isLoading: false,

  userChanged: function () {
    this.set('isLoading', false);
    if (this.get('session.transition')) {
      this.get('session.transition').retry();
    } else {
      this.transitionToRoute('wh');
    }
  }.observes('session.user'),

  errorChanged: function () {
    this.set('isLoading', false);
  }.observes('session.error'),

  actions: {
    loginUser: function () {
      if (this.get('isLoading')) {
        return;
      }
      this.set('isLoading', true);
      this.get('session').set('error', null);
      this.get('session.auth').login('password', {
        email     : this.get('email'),
        password  : this.get('password'),
        rememberMe: true
      });
    }
  }
});
