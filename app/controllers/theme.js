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
        window.ENV.firebase.child('contentType').set(data, function(err) {
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
        window.ENV.firebase.child('contentType').set(data, function(err) {
          window.ENV.sendGruntCommand('build', function() {
            this.set('isSending', false);
            this.transitionToRoute('wh');
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }
});
