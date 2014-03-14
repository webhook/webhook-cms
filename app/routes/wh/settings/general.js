export default Ember.Route.extend({
  model: function () {
    return this.store.find('settings', 'site');
  },

  afterModel: function (model) {
    window.console.log(model.get('siteName'));
  }
});
