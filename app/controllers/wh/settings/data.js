import SearchIndex from 'appkit/utils/search-index';

export default Ember.Controller.extend({

  needs: ['application'],

  deleteOption: 'data',
  isDeleting: false,
  isRefreshingApi: false,

  isIndexing: false,
  downloadLink: '',
  downloadFileName: '',
  apiKey: 'Loading...',

  contentTypes: null,

  isDeleteData: function () {
    return this.get('deleteOption') === 'data';
  }.property('deleteOption'),

  deleteData: function () {

    var controller = this;

    Ember.RSVP.Promise.all(this.store.all('content-type').map(function (contentType) {
      contentType.destroyRecord();
    })).then(function () {
      window.ENV.firebase.child('settings').set(null, function () {
        controller.send('buildSignal');
        controller.set('isDeleting', false);
        controller.transitionToRoute('start');
      });
      SearchIndex.deleteSite();
    });

  },

  wordpressXml: null,

  actions: {

    refreshApi: function() {
      var newKey = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c==='x'?r:r&0x3|0x8;return v.toString(16);});

      var allow = true;
      if(Ember.I18n.translations.wh && Ember.I18n.translations.wh.settings &&
         Ember.I18n.translations.wh.settings.data && Ember.I18n.translations.wh.settings.data.api) {
        allow = window.confirm(Ember.I18n.translations['wh']['settings']['data']['api']['warning']);
      }

      if(!allow) {
        return;
      }

      this.set('isRefreshingApi', true);
      window.ENV.firebaseRoot.child('management/sites').child(this.get('session.site.name')).child('api-key').set(newKey, function(err) {
        this.set('apiKey', newKey);
        this.set('isRefreshingApi', false);
      }.bind(this));
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

    goToImport: function () {
      this.transitionToRoute('import');
    },

    reset: function () {
      this.set('controllers.application.importData', null);
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
