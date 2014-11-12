export default {
  name: 'environment',

  initialize: function (container, application) {

    var buildEnv = Ember.Object.create();

    application.register('environment:current', buildEnv, { instantiate: false, singleton: true });
    Ember.A(['model', 'controller', 'view', 'route', 'helper', 'component']).forEach(function (component) {
      application.inject(component, 'buildEnvironment', 'environment:current');
    });

  }
};
