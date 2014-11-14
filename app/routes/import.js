import SearchIndex from 'appkit/utils/search-index';

export default Ember.Route.extend({

  controllerName: 'reindex',

  beforeModel: function () {

    var data = this.controllerFor('wh.settings.data').get('dataBackup');

    if (Ember.isEmpty(data)) {
      this.transitionTo('wh.settings.data');
    } else {
      this.set('data', data);
    }

    var removeContentTypes = this.modelFor('wh').map(function (contentType) {
      return contentType.destroyRecord();
    });

    var removeSettings = this.store.find('settings').then(function (settings) {
      return settings.map(function (setting) {
        return setting.destroyRecord();
      });
    });

    var removeRef = function (ref) {
      new Ember.RSVP.Promise(function (resolve, reject) {
        window.ENV.firebase.child(ref).remove(function (error) {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    };

    return Ember.RSVP.all([
      removeContentTypes,
      removeRef('settings'),
      removeRef('data')
    ]);

  },

  model: function () {
    return this.modelFor('wh');
  },

  afterModel: function (model) {

    var data = this.get('data');

    return new Ember.RSVP.Promise(function (resolve, reject) {
      window.ENV.firebase.update(data, function (error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    }).then(function () {
      SearchIndex.indexSite();
    });
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
