export default Ember.Route.extend({

  defaultMessage: function () {
    var msg = '';

    msg += '#' + Em.I18n.t('wh.index.welcome.title') + "\n\n";
    msg += Em.I18n.t('wh.index.welcome.description') + "\n\n";

    msg += '* [%@](%@)'.fmt(Em.I18n.t('wh.index.welcome.docs'), "http://www.webhook.com/docs/") + "\n";
    msg += '* [%@](%@)'.fmt(Em.I18n.t('wh.index.welcome.support'), "http://www.webhook.com/help/") + "\n";
    msg += '* [%@](%@)'.fmt(Em.I18n.t('wh.index.welcome.issues'), "https://github.com/webhook/webhook/issues?state=open") + "\n";
    msg += '* [%@](%@)'.fmt(Em.I18n.t('wh.index.welcome.forums'), "http://forums.webhook.com/") + "\n";

    return msg;
  }.property(),

  beforeModel: function () {
    var route = this;

    return this.store.find('settings', 'general').then(function (settings) {
      if (Ember.isEmpty(settings.get('siteMessage'))) {
        settings.set('siteMessage', route.get('defaultMessage'));
      }
      route.set('settings', settings);
    }, function (error) {
      var settings = route.store.getById('settings', 'general');
      settings.loadedData();
      if (route.get('session.isOwner')) {
        return settings.save().then(function () {
          settings.set('siteMessage', route.get('defaultMessage'));
          route.set('settings', settings);
        });
      }
    });

  },

  setupController: function (controller) {

    this._super.apply(this, arguments);

    controller.set('contentTypes', this.modelFor('wh'));
    controller.set('settings', this.get('settings'));
    controller.set('defaultMessage', this.get('defaultMessage'));
  },

  actions: {
    willTransition: function (transition) {
      this.get('settings').rollback();
    }
  }
});
