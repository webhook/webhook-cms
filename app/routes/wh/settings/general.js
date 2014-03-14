export default Ember.Route.extend({
  model: function () {
    return this.store.find('settings', 'general').then(null, function () {

      var settings = this.store.push('settings', { id: 'general' });

      return Ember.RSVP.resolve(settings);

    }.bind(this));
  }
});
