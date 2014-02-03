export default Ember.Route.extend({
  actions: {
    logoutUser: function () {
      this.get('session.auth').logout();
    }
  }
});
