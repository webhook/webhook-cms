// import Settings from 'appkit/models/settings';

export default Ember.Route.extend({
  model: function () {
    var route = this;
    return this.store.find('settings', 'general').then(null, function () {
      var settings = route.store.getById('settings', 'general');
      settings.loadedData();
      return settings;
    });
  }
});
