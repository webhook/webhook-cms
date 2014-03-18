export default Ember.ObjectController.extend({
  actions: {
    saveSettings: function () {
      this.get('model').save().then(function () {
        this.send('notify', 'success', 'Settings saved!');
      }.bind(this));
    }
  }
});
