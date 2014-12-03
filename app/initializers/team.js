export default {
  name: 'team',

  initialize: function (container, application) {

    var team = Ember.Object.create();

    // Add `session` to all the things
    application.register('team:current', team, { instantiate: false });
    Ember.A(['model', 'controller', 'view', 'route', 'component']).forEach(function (component) {
      application.inject(component, 'team', 'team:current');
    });

  }
};
