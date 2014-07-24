export default Ember.ObjectController.extend({
  themes   : null,
  isSending: false,
  success  : false,
  error    : null,
  customUrl: '',

  actions: {
    downloadPreset: function (theme) {

      this.setProperties({
        success: false,
        error: null
      });

      this.set('isSending', true);
      window.ENV.sendGruntCommand('preset:' + theme.url, function(data) {

        if (Ember.isNone(data.data) && Ember.isNone(data.contentType)) {
          data = { contentType: data };
        }

        window.ENV.firebase.update(data, function(err) {
          window.ENV.sendGruntCommand('build', function() {
            this.set('isSending', false);
            this.send('notify', 'success', 'Theme installation complete.');
            this.transitionToRoute('wh');
          }.bind(this));
        }.bind(this));
      }.bind(this));
    },

    downloadCustom: function () {

      this.setProperties({
        success: false,
        error: null
      });

      if(!this.get('customUrl')) {
        this.set('error', { message: 'Please provide a custom URL.' });
        return;
      }

      this.set('isSending', true);
      window.ENV.sendGruntCommand('preset:' + this.get('customUrl'), function(data) {

        if (Ember.isNone(data.data) && Ember.isNone(data.contentType)) {
          data = { contentType: data };
        }

        window.ENV.firebase.update(data, function(err) {
          window.ENV.sendGruntCommand('build', function() {
            this.set('isSending', false);
            this.send('notify', 'success', 'Theme installation complete.');
            this.transitionToRoute('wh');
          }.bind(this));
        }.bind(this));
      }.bind(this));
    },

    localThemeSelected: function (file) {

      this.setProperties({
        success: false,
        error: null
      });

      if(!file) {
        this.set('error', { message: 'Please select a zip file.' });
        return;
      }

      this.set('isSending', true);

      var reader = new window.FileReader();

      reader.onload = function(e) {

        // strip off 'data:application/zip;base64,'
        var base64Data = e.target.result.split(',').slice(1).join(',');

        window.ENV.sendGruntCommand('preset_local:' + base64Data, function(data) {

          if (Ember.isNone(data.data) && Ember.isNone(data.contentType)) {
            data = { contentType: data };
          }

          window.ENV.firebase.update(data, function(err) {
            window.ENV.sendGruntCommand('build', function() {
              this.set('isSending', false);
              this.send('notify', 'success', 'Theme installation complete.');
              this.transitionToRoute('wh');
            }.bind(this));
          }.bind(this));
        }.bind(this));
      };

      reader.readAsDataURL(file);

    }
  }
});
