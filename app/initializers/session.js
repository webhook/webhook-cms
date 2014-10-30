export default {
  name: 'session',

  initialize: function (container, application) {

    var session = Ember.Object.create({
      auth: null,
      user: null,
      site: Ember.Object.create({
        name: Ember.$('meta[name="siteName"]').attr('content'),
        token: null
      })
    });

    // Add `session` to all the things
    application.register('session:current', session, { instantiate: false });
    Ember.A(['model', 'controller', 'view', 'route', 'component']).forEach(function (component) {
      application.inject(component, 'session', 'session:current');
    });

  }
};
