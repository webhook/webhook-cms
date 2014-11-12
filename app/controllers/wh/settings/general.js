export default Ember.ObjectController.extend({
  actions: {
    saveSettings: function () {
      var controller = this;
      controller.get('model').save().then(function () {
        controller.send('notify', 'success', 'Settings saved!');
        controller.send('buildSignal');
      });
    }
  }
});
