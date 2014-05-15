export default Ember.Controller.extend({
  dataBackup: null,
  dataError: null,

  dataBreakdown: function () {

    var dataBackup = this.get('dataBackup');

    if (!dataBackup) {
      return {};
    }

    var types = Ember.A(Object.keys(dataBackup.contentType || {}));

    types.addObjects(Object.keys(dataBackup.data || {}));

    return {
      content: Ember.$.map(types, function (typeName) {
        return {
          name: typeName,
          itemCount: (dataBackup.data || {})[typeName] && Object.keys((dataBackup.data || {})[typeName]).length
        };
      }),
      settings: Ember.$.map((dataBackup.settings || {}).general || {}, function (value, name) {
        return {
          name: name,
          value: value
        };
      })
    };

  }.property('dataBackup'),

  setData: function (rawData) {
    if (!rawData) {
      return;
    }

    Ember.Logger.info('Filtering data for import.');

    var dataController = this;

    // We only want contentType, data, and settings.
    var filteredData = {};
    Ember.$.each(['contentType', 'data', 'settings'], function (index, dataKey) {
      if (rawData[dataKey]) {
        Ember.Logger.info('Found data for', dataKey);
        filteredData[dataKey] = rawData[dataKey];
      }
    });

    // make sure we only import data for contentTypes that exist
    Ember.Logger.info('Matching data with contentTypes.');
    new Ember.RSVP.Promise(function (resolve, reject) {

      var matchedData = {};

      if (!filteredData.data) {
        // If we don't have any data just keep on truckin'
        Ember.Logger.info('Not importing data, continue.');
        Ember.run(null, resolve, filteredData);
      }

      else if (filteredData.contentType) {
        // If we're importing contentTypes make sure the data is covered
        Ember.$.each(filteredData.data, function (contentTypeId, items) {
          if (filteredData.contentType[contentTypeId]) {
            Ember.Logger.info('Content type for', contentTypeId, 'found.');
            matchedData[contentTypeId] = items;
          } else {
            Ember.Logger.info('No content type found for', contentTypeId);
          }
        });
        filteredData.data = matchedData;
        Ember.run(null, resolve, filteredData);
      }

      else {
        // If we are not importing contentTypes, make sure data corresponds to content types we already have
        var typePromises = Ember.A([]);

        Ember.$.each(filteredData.data, function (contentTypeId, items) {
          var typePromise = dataController.store.find('content-type', contentTypeId).then(function (contentType) {
            Ember.Logger.info('Content type found for', contentTypeId);
            matchedData[contentTypeId] = items;
          }).catch(function (error) {
            Ember.Logger.info('Ignoring error:', error);
          });

          typePromises.addObject(typePromise);
        });

        Ember.Logger.info('Waiting for', typePromises.get('length'), 'content type promises.');

        Ember.RSVP.all(typePromises).then(function () {
          filteredData.data = matchedData;
          Ember.run(null, resolve, filteredData);
        });
      }

    }).then(function (data) {
      dataController.set('dataBackup', data);
    });

  },

  indexItem: function (data, id, contentType) {

    Ember.Logger.info('Updating search index:', contentType.get('id'), id);

    var searchData = {};
    Ember.$.each(data, function (key, value) {
      if (typeof value === 'object') {
        searchData[key] = JSON.stringify(value);
      } else {
        searchData[key] = value;
      }
    });
    window.ENV.indexItem(id, searchData, contentType.get('oneOff'), contentType.get('id'));
  },

  actions: {
    download: function () {
      window.ENV.firebase.once('value', function (snapshot) {
        var data = snapshot.val();

        var dataWhiteList = {
          contentType: data.contentType,
          data: data.data,
          settings: data.settings
        };

        var blob = new window.Blob([JSON.stringify(dataWhiteList, null, 2)], { type: "text/plain;charset=utf-8" });
        window.saveAs(blob, moment().format() + '.json');
      });
    },

    upload: function () {

      var dataController = this;

      dataController.set('dataError', null);

      Ember.$('<input type="file">').fileReaderJS({
        accept: "application/json",
        readAsDefault: 'Text',
        on: {
          load: function (event, file) {
            var rawData;
            try {
              rawData = JSON.parse(event.target.result);
            } catch (error) {
              Ember.Logger.error(error);
              dataController.set('dataError', error);
            }

            dataController.setData.call(dataController, rawData);

          }
        }
      }).trigger('click');

    },

    confirm: function () {

      var store = this.store;
      var dataController = this;

      // Remove search index info for every type type
      store.find('content-type').then(function (contentTypes) {
        contentTypes.forEach(function (contentType) {
          window.ENV.deleteTypeIndex(contentType.get('id'));
        });
      }).then(function () {

        window.ENV.firebase.update(dataController.get('dataBackup'), function () {
          dataController.send('notify', 'success', 'Backup applied!');
          dataController.set('dataBackup', null);
        }.bind(this));

        // Update the search index with the new data.
        Ember.$.each(dataController.get('dataBackup.data'), function (contentTypeId, items) {
          Ember.Logger.info('Updating search index for', contentTypeId);
          store.find('content-type', contentTypeId).then(function (contentType) {
            if (contentType.get('oneOff')) {
              dataController.indexItem(items, contentTypeId, contentType);
            } else {
              Ember.$.each(items, function (id, item) {
                dataController.indexItem(item, id, contentType);
              });
            }
          }).catch(function (error) {
            Ember.Logger.error(error);
          });
        });

      });
    },

    reset: function () {
      this.set('dataBackup', null);
    }
  }
});
