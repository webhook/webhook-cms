import SearchIndex from 'appkit/utils/search-index';

export default Ember.Controller.extend({

  needs: ['application'],

  // dataBackup: null,
  dataError: null,

  deleteOption: 'data',
  isDeleting: false,

  isIndexing: false,
  downloadLink: '',
  downloadFileName: '',
  apiKey: 'Loading...',

  contentTypes: null,

  isDeleteData: function () {
    return this.get('deleteOption') === 'data';
  }.property('deleteOption'),

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

  dataBackup: function () {
    return this.get('controllers.application.importData');
  }.property('controllers.application.importData'),

  deleteData: function () {

    var dataController = this;

    // first delete all search indexes
    dataController.store.find('content-type').then(function (contentTypes) {
      return Ember.RSVP.allSettled(contentTypes.map(function (contentType) {
        return SearchIndex.deleteType(contentType).then(function () {
          return contentType.destroyRecord();
        });
      }));
    }).then(function () {

      // delete all site data
      window.ENV.firebase.update({
        data: null,
        contentType: null,
        settings: null
      }, function () {
        dataController.send('buildSignal');
        dataController.set('isDeleting', false);
        dataController.transitionToRoute('start');
      });

    });
  },

  wordpressXml: null,

  actions: {

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

    confirm: function () {
      this.transitionToRoute('import');
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
        dataController.send('gruntCommand', 'reset_files', function (error) {

          if (error) {
            Ember.Logger.error(error);
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
        var blob = new window.Blob([data], { type: "text/plain;charset=utf-8" });
        window.saveAs(blob, backup.fileName);
      });
    }
  }
});
