export default Ember.ObjectController.extend({

  supportedLanguages: function () {
    var languages = Ember.A([]);
    Ember.$.each(Ember.ENV.I18N_CODE_MAP, function (code, language) {
      languages.push({ code: code, language: language });
    });
    return languages;
  }.property(),

  actions: {
    saveSettings: function () {
      this.get('model').save().then(function () {
        this.send('notify', 'success', 'Settings saved!');
        window.ENV.sendBuildSignal();
      }.bind(this));
    }
  }
});
