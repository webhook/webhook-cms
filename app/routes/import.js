import SearchIndex from 'appkit/utils/search-index';

export default Ember.Route.extend({

  model: function () {
    return this.store.find('content-type');
  },

  setupController: function (controller) {

    this._super.apply(this, arguments);

    if (this.controllerFor('application').get('jsonBackup')) {
      controller.readFile(this.controllerFor('application').get('jsonBackup'));
    }

  },

  actions: {

    willTransition: function (transition) {

      if (this.controller.get('isIndexing')) {
        Ember.Logger.log('Indexing in progress, aborting transition');
        transition.abort();
        window.history.forward();
      } else {
        Ember.Logger.log('Indexing complete, continue with transition.');
        return true;
      }

    }
  }
});
