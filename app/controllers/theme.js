export default Ember.ObjectController.extend({
  themes   : null,
  isSending: false,
  success  : false,
  error    : null,

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
            this.transitionToRoute('wh');
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }
});
