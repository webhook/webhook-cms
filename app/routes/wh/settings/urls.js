export default Ember.Route.extend({
  model: function () {
    return this.store.find('redirect').then(function (redirects) {
      redirects.forEach(function (redirect, index) {
        redirect.set('priority', index);
      });
      return Ember.RSVP.Promise.resolve(redirects);
    });
  }
});
