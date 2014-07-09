export default {
  indexItem: function (item, contentType) {

    var searchData = {};
    Ember.$.each(item.get('data'), function (key, value) {
      if (typeof value === 'object') {
        searchData[key] = JSON.stringify(value);
      } else {
        searchData[key] = value;
      }
    });

    window.ENV.indexItem(item.get('id'), searchData, contentType.get('oneOff'), contentType.get('id'));
  },
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
  }

};
