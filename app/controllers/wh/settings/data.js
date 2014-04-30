export default Ember.Controller.extend({
  dataBackup: null,
  dataError: null,

  dataBreakdown: function () {

    var dataBackup = this.get('dataBackup');

    if (!dataBackup) {
      return {};
    }

    return {
      content: Ember.$.map(dataBackup.contentType, function (type, typeName) {
        return {
          name: typeName,
          itemCount: dataBackup.data[typeName] && Object.keys(dataBackup.data[typeName]).length
        };
      }),
      settings: Ember.$.map(dataBackup.settings.general, function (value, name) {
        return {
          name: name,
          value: value
        };
      })
    };

  }.property('dataBackup'),

  actions: {
    download: function () {
      window.ENV.firebase.once('value', function (snapshot) {
        var data = snapshot.val();

        // we don't need presence data.
        if (data.presence) {
          delete data.presence;
        }

        var blob = new window.Blob([JSON.stringify(data, null, 2)], {type: "text/plain;charset=utf-8"});
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

            if (!rawData) {
              return;
            }

            // We only want contentType, data, and settings.
            var filteredData = {};
            Ember.$.each(['contentType', 'data', 'settings'], function (index, dataKey) {
              if (rawData[dataKey]) {
                filteredData[dataKey] = rawData[dataKey];
              }
            });
            dataController.set('dataBackup', filteredData);

            // window.ENV.firebase.update(filteredData, function () {
            //   dataController.send('notify', 'success', 'Backup applied!');
            // });

          }
        }
      }).trigger('click');

    },

    confirm: function () {
      window.ENV.firebase.update(this.get('dataBackup'), function () {
        this.send('notify', 'success', 'Backup applied!');
        this.set('dataBackup', null);
      }.bind(this));
    },

    reset: function () {
      this.set('dataBackup', null);
    }
  }
});
