export default {
  baseUrl: window.ENV.uploadUrl + 'search/',

  search: function (query, page, typeName) {

    if (Ember.isNone(query)) {
      return Ember.RSVP.Promise.reject(new Ember.Error('Search query is required.'));
    }

    Ember.Logger.log('searchIndex::search::%@::%@'.fmt(query, typeName || 'all types'));

    var SearchIndex = this;

    return new Ember.RSVP.Promise(function (resolve, reject) {
      Ember.$.ajax({
        url: window.ENV.uploadUrl + 'search/',
        type: 'POST',
        data: Ember.$.extend(SearchIndex.siteAndToken(), {
          query: query,
          page: page || 1,
          typeName: typeName || null
        }),
        success: resolve,
        error: reject
      });
    }).then(function (data) {

      if (data.error) {
        return Ember.RSVP.reject(data.error);
      } else {

        var items = Ember.A([]);

        Ember.$.each(data.hits, function(index, value) {
          var highlights = Ember.A([]);

          var name = value.fields.name ? value.fields.name[0] : '';

          if (value.highlight) {
            for (var key in value.highlight) {
              if(key === 'name') {
                name = value.highlight[key][0];
              } else {
                highlights.push({
                  key: key,
                  highlight: value.highlight[key][0]
                });
              }
            }
          }

          items.push({
            name: name,
            oneOff: value.fields.__oneOff ? (value.fields.__oneOff[0] === "true" ? true : false ): false,
            id: value._id,
            type: value._type,
            highlights: highlights
          });
        });

        return Ember.RSVP.resolve(items);
      }
    });

  },

  indexItem: function (item) {

    if (Ember.isEmpty(item) || Ember.isEmpty(item.get('itemData')) || !Ember.keys(item.get('itemData')).get('length')) {
      return Ember.RSVP.reject('Cannot index without an item data.');
    }

    var typeKey = item.constructor.typeKey;

    // handle one offs
    if (typeKey === 'data') {
      typeKey = item.get('id');
    }

    var contentType = item.store.getById('content-type', typeKey);

    if (Ember.isEmpty(contentType)) {
      return Ember.RSVP.reject('Cannot index without a content type.');
    }

    var searchData = {};

    // Simplify search indexing by storing all objects as strings.
    Ember.$.each(item.get('itemData'), function (key, value) {
      if (value === null) {
        return;
      }
      if (item.get('itemData').hasOwnProperty(key)) {
        if (typeof value === 'object') {
          if (JSON.stringify(value) !== '{}') {
            searchData[key] = JSON.stringify(value);
          }
        } else {
          searchData[key] = value;
        }
      }
    });

    var ajaxData = Ember.$.extend(this.siteAndToken(), {
      id: item.get('id'),
      data: JSON.stringify(searchData),
      typeName: contentType.get('id'),
      oneOff: contentType.get('oneOff')
    });

    Ember.Logger.log("SearchIndex::indexItem::%@::%@".fmt(contentType.get('id'), item.get('itemData.name')));

    return Ember.$.ajax({
      url: this.baseUrl + 'index/',
      type: 'POST',
      data: ajaxData
    });

  },

  indexType: function (contentType) {

    Ember.Logger.log("SearchIndex::indexType::%@".fmt(contentType.get('id')));

    var SearchIndex = this;
    var modelName = contentType.get('itemModelName');
    var store = contentType.store;

    contentType.set('indexingComplete', 0);
    contentType.set('indexingTotal', Infinity);

    return SearchIndex.deleteType(contentType).then(function () {

      if (contentType.get('oneOff')) {

        return store.find(modelName, contentType.get('id')).then(function (item) {

          contentType.set('indexingTotal', 1);

          return SearchIndex.indexItem(item).then(function () {
            contentType.incrementProperty('indexingComplete');
          });

        }, function (error) {
          contentType.set('indexingTotal', 0);
          Ember.Logger.warn('SearchIndex::indexType::Could not find %@, continuing.'.fmt(contentType.get('id')));
        });

      } else {

        return store.find(modelName).then(function (items) {

          contentType.set('indexingTotal', items.get('length'));

          var indexItems = items.map(function (item) {
            return SearchIndex.indexItem(item).then(function () {
              contentType.incrementProperty('indexingComplete');
            });
          });

          return Ember.RSVP.allSettled(indexItems);

        });

      }

    });

  },

  indexSite: function () {

    Ember.Logger.log("SearchIndex::indexSite");

    var SearchIndex = this;
    var store = window.App.__container__.lookup('store:main');

    return store.find('content-type').then(function (contentTypes) {

      var contentTypePromises = contentTypes.map(function (contentType) {
        return SearchIndex.indexType(contentType);
      });

      return Ember.RSVP.Promise.all(contentTypePromises);

    });

  },

  deleteItem: function (item) {

    var typeKey = item.constructor.typeKey;

    // handle one offs
    if (typeKey === 'data') {
      typeKey = item.get('id');
    }

    var contentType = item.store.getById('content-type', typeKey);

    if (Ember.isEmpty(contentType)) {
      return Ember.RSVP.reject('Cannot delete item index without a content type.');
    }

    Ember.Logger.log("SearchIndex::deleteItem::%@::%@".fmt(contentType.get('id'), item.get('itemData.name')));

    return Ember.$.ajax({
      url: this.baseUrl + 'delete/',
      type: 'POST',
      data: Ember.$.extend(this.siteAndToken(), {
        id: item.get('id'),
        typeName: contentType.get('id')
      })
    });
  },

  // contentType can be id or model
  deleteType: function (contentType) {

    var id = typeof contentType === 'string' ? contentType : contentType.get('id');

    Ember.Logger.log("SearchIndex::deleteType::%@".fmt(id));

    return Ember.$.ajax({
      url: this.baseUrl + 'delete/type/',
      type: 'POST',
      data: Ember.$.extend(this.siteAndToken(), {
        typeName: id
      })
    });
  },

  deleteSite: function () {
    Ember.Logger.log("SearchIndex::deleteSite");
    return Ember.$.ajax({
      url: this.baseUrl + 'delete/index/',
      type: 'POST',
      data: this.siteAndToken()
    });
  },

  reindex: function () {
    return this.indexSite();
  },

  siteAndToken: function () {
    var session = window.App.__container__.lookup('controller:application').get('session');

    return {
      site: session.get('site.name'),
      token: session.get('site.token')
    };
  }

};
