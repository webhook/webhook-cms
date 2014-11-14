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

  },

  model: function () {
    return this.store.find('content-type');
  },

  afterModel: function (model) {

    var route = this;

    var removeContentTypes = model.map(function (contentType) {
      return contentType.destroyRecord();
    });

    var removeRef = function (ref) {
      return new Ember.RSVP.Promise(function (resolve, reject) {
        window.ENV.firebase.child(ref).remove(function (error) {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    };

    Ember.RSVP.all([
      removeContentTypes,
      removeRef('data'),
      removeRef('settings')
    ]).then(function () {
      return new Ember.RSVP.Promise(function (resolve, reject) {
        window.ENV.firebase.update(route.get('data'), function (error) {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
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
