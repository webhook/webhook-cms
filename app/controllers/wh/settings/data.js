import SearchIndex from 'appkit/utils/search-index';

export default Ember.Controller.extend({
  dataBackup: null,
  dataError: null,

  deleteOption: 'data',
  isDeleting: false,

  isIndexing: false,
  downloadLink: '',
  downloadFileName: '',

  dataBreakdown: function () {

    var dataBackup = this.get('dataBackup');

    if (!dataBackup) {
      return {};
    }

    var dataController = this;

    var types = Ember.A(Object.keys(dataBackup.contentType || {}));

    types.addObjects(Object.keys(dataBackup.data || {}));

    var breakdown = {
      content: Ember.$.map(types, function (typeName) {

        var itemCount;

        if ((dataBackup.data || {})[typeName]) {
          var contentType = dataController.store.getById('content-type', typeName);
          var oneOff = contentType ? contentType.get('oneOff') : dataBackup.contentType[typeName].oneOff;
          if (oneOff) {
            itemCount = 1;
          } else {
            itemCount = Object.keys((dataBackup.data || {})[typeName]).length;
          }
        }

        return {
          name: typeName,
          itemCount: itemCount
        };
      }),
      settings: Ember.$.map((dataBackup.settings || {}).general || {}, function (value, name) {
        return {
          name: name,
          value: value
        };
      })
    };

    return breakdown;

  }.property('dataBackup'),

  validImport: function () {
    return this.get('dataBreakdown.content.length') || this.get('dataBreakdown.content.length');
  }.property('dataBreakdown'),

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

        Ember.$.each(filteredData.data, function (contentTypeId, items) {

          // all content types should already be in the store from the 'wh' model
          if (dataController.store.getById('content-type', contentTypeId)) {
            Ember.Logger.info('Content type found for', contentTypeId);
            matchedData[contentTypeId] = items;
          }

        });

        filteredData.data = matchedData;
        Ember.run(null, resolve, filteredData);
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

  deleteData: function () {

    var dataController = this;

    // first delete all search indexes
    dataController.store.find('content-type').then(function (contentTypes) {
      contentTypes.forEach(function (contentType) {
        window.ENV.deleteTypeIndex(contentType.get('id'));
      });
    }).then(function () {

      // delete all site data
      window.ENV.firebase.update({
        data: null,
        contentType: null,
        settings: null
      }, function () {
        window.ENV.sendBuildSignal();
        dataController.set('isDeleting', false);
        dataController.transitionToRoute('start');
      });

    });
  },

  wordpressXml: null,

  actions: {
    wordpressFileSelected: function(file) {
      this.set('wordpressXml', file);
      this.transitionToRoute('wordpress');
    },

    download: function () {

      var fileName = this.get('buildEnvironment.siteDisplayName') + '-' + moment().format() + '.json';

      window.ENV.firebase.once('value', function (snapshot) {
        var data = snapshot.val();

        var dataWhiteList = {
          contentType: data.contentType,
          data: data.data,
          settings: data.settings
        };

        var blob = new window.Blob([JSON.stringify(dataWhiteList, null, 2)], { type: "text/plain;charset=utf-8" });
        window.saveAs(blob, fileName);
      });
    },

    upload: function () {

      var dataController = this;

      dataController.set('dataError', null);

      Ember.$('<input type="file">').fileReaderJS({
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
          window.ENV.sendBuildSignal();
        }.bind(this));

        // Update the search index with the new data.
        Ember.$.each(dataController.get('dataBackup.data'), function (contentTypeId, items) {
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
    },

    deleteData: function () {

      var dataController = this;

      var warning = 'You are about to delete all of your site data';

      if (dataController.get('deleteOption') === 'everything') {
        warning = warning + ', templates, and static files';
      }

      warning = warning + '. This cannot be undone. Would you like to proceed?';

      if (!window.confirm(warning)) {
        return;
      }

      dataController.set('isDeleting', true);

      if (dataController.get('deleteOption') === 'everything') {
        // delete files first
        window.ENV.sendGruntCommand('reset_files', function (error) {

          if (error) {
            dataController.set('isDeleting', false);
            window.alert("Not all files could be deleted. Please close any open project files and directories and try again.");
          } else {
            dataController.deleteData();
          }

        });
      } else {
        dataController.deleteData();
      }

    },

    getBackup: function (backup) {

      var dataController = this;

      Ember.$.get(backup.url).done(function (data) {
        if (!data) {
          dataController.send('notify', 'danger', 'Backup has no data.');
          return;
        }
        var blob = new window.Blob([data, { type: "text/plain;charset=utf-8" }]);
        window.saveAs(blob, backup.fileName);
      });
    },

    reindex: function () {

      this.set('isIndexing', true);
      SearchIndex.reindex().then(function () {
        this.set('isIndexing', false);
      }.bind(this));
    }
  }
});
