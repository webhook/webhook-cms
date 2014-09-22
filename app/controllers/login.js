export default Ember.ObjectController.extend({
  email    : null,
  password : null,
  isLoading: false,

  userChanged: function () {
    this.set('isLoading', false);
  }.observes('session.user'),

  errorChanged: function () {
    this.set('isLoading', false);
  }.observes('session.error'),

  supportedLanguages: function () {
    var languages = Ember.A([]);
    Ember.$.each(Ember.ENV.I18N_CODE_MAP, function (code, language) {
      languages.push({ code: code, language: language });
    });
    return languages;
  }.property(),

  actions: {
    loginUser: function () {
      if (this.get('isLoading')) {
        return;
      }

      this.get('session').set('error', null);
      this.set('isLoading', true);

      this.get('session.auth').login('password', {
        email     : this.get('email'),
        password  : this.get('password'),
        rememberMe: true
      });
    }
  }
});
