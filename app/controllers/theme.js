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

      var reader = new FileReader();

      reader.onload = function(e) {
        window.ENV.sendGruntCommand('preset_local:' + e.target.result, function () {
          window.console.log(arguments);
        });
      };

      reader.readAsText(file);

    }
  }
});
