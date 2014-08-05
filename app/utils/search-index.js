import getItemModelName from 'appkit/utils/model';

export default {
  baseUrl: 'http://server.webhook.com/search/',

  search: function (query, page, typeName) {

    Ember.Logger.log('searchIndex::search', arguments);

    if (Ember.isNone(query)) {
      return Ember.RSVP.Promise.reject(new Ember.Error('Search query is required.'));
    }

    return new Ember.RSVP.Promise(function (resolve, reject) {

      window.ENV.search(query, page || 1, typeName || null, function(error, results) {
        if (error) {
          Ember.Logger.warn('searchIndex::search::error', error);
          reject(error);
        } else {
          Ember.Logger.info('searchIndex::search::results', results);
          resolve(results);
        }
      });
    });

  },

  indexItem: function (item, contentType) {

    var searchData = {};

    // Simplify search indexing by storing all objects as strings.
    Ember.$.each(item.get('data'), function (key, value) {
      if (typeof value === 'object') {
        searchData[key] = JSON.stringify(value);
      } else {
        searchData[key] = value;
      }
    });

    return Ember.$.ajax({
      url: this.baseUrl + 'index/',
      type: 'POST',
      data: Ember.$.extend(this.siteAndToken(), {
        id: item.get('id'),
        data: JSON.stringify(searchData),
        typeName: contentType.get('id'),
        oneOff: contentType.get('oneOff')
      })
    });
  },

  indexType: function (contentType) {

    var indexItem = this.indexItem.bind(this);
    var modelName = getItemModelName(contentType);
    var store = window.App.__container__.lookup('store:main');

    return new Ember.RSVP.Promise(function (resolve, reject) {
      store.find(modelName).then(function (items) {

        var idsToDelete = [1,2,3];

        return items.reduce(function (cur, next) {
          return cur.then(function () {
            return indexItem(next, contentType);
          });
        }, Ember.RSVP.resolve());

        // var itemPromises = [];
        //
        // items.forEach(function (item) {
        //   itemPromises.push(indexItem(item, contentType));
        // });
        //
        // Ember.RSVP.Promise.all(itemPromises).then(resolve).catch(reject);

      });

    });
  },

  indexSite: function () {
    var store = window.App.__container__.lookup('store:main');
    var indexType = this.indexType.bind(this);

    return new Ember.RSVP.Promise(function (resolve, reject) {
      store.find('contentType').then(function (contentTypes) {

        var contentTypePromises = [];

        contentTypes.forEach(function (contentType) {
          contentTypePromises.push(indexType(contentType));
        });

        Ember.RSVP.Promise.all(contentTypePromises).then(resolve).catch(reject);

      });

    });

  },

  deleteItem: function (item, contentType) {
    return Ember.$.ajax({
      url: this.baseUrl + 'delete/',
      type: 'POST',
      data: Ember.$.extend(this.siteAndToken(), {
        id: item.get('id'),
        typeName: contentType.get('id')
      })
    });
  },

  deleteType: function (contentType) {
    return Ember.$.ajax({
      url: this.baseUrl + 'delete/type/',
      type: 'POST',
      data: Ember.$.extend(this.siteAndToken(), {
        typeName: contentType.get('id')
      })
    });
  },

  deleteSite: function () {
    return Ember.$.ajax({
      url: this.baseUrl + 'delete/index/',
      type: 'POST',
      data: this.siteAndToken()
    });
  },

  reindex: function () {

    return this.deleteSite().then(this.indexSite.bind(this));

  },

  siteAndToken: function () {
    var session = window.App.__container__.lookup('controller:application').get('session');

    return {
      site: session.get('site.name'),
      token: session.get('site.token')
    };
  }

};
