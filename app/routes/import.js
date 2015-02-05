import SearchIndex from 'appkit/utils/search-index';

export default Ember.Route.extend({

  beforeModel: function () {
    // Makre sure content types are in the store
    this.store.find('content-type');

    // Make sure settings are in the store
    this.store.find('settings');

    // Make sure redirects are in the store
    this.store.find('redirect');
  },

  model: function () {
    return Ember.A([]);
  },

  setupController: function (controller) {

    this._super.apply(this, arguments);

    if (this.controllerFor('application').get('jsonBackup')) {
      controller.readFile(this.controllerFor('application').get('jsonBackup'));
    }

  }
});
