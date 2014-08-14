import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';

Ember.debouncedObserver = function(func, key, time) {
  return Em.observer(function() {
    Em.run.debounce(this, func, time);
  }, key);
};

Ember.throttledObserver = function(func, key, time) {
  return Em.observer(function() {
    Em.run.throttle(this, func, time);
  }, key);
};

Ember.MODEL_FACTORY_INJECTIONS = true;

var App = Ember.Application.extend({
  LOG_ACTIVE_GENERATION   : true,
  LOG_MODULE_RESOLVER     : true,
  LOG_TRANSITIONS         : true,
  LOG_TRANSITIONS_INTERNAL: true,
  LOG_VIEW_LOOKUPS        : true,
  modulePrefix            : 'appkit', // TODO: loaded via config
  Resolver                : Resolver['default'],
  init: function () {
    window.ENV.firebaseRoot = new Firebase("https://" + window.ENV.dbName + ".firebaseio.com/");
    this._super.apply(this, arguments);
  }
});

loadInitializers(App, 'appkit');

// Before any route, kick user to login if they aren't logged in
Ember.Route.reopen({
  beforeModel: function (transition) {
    var openRoutes = ['login', 'password-reset', 'create-user', 'confirm-email', 'resend-email', 'expired'];

    if (this.get('session.user') && this.get('session.billing.active') === false && transition.targetName !== 'expired') {
      Ember.Logger.info('Site is not active, redirecting to expired route.');
      transition.abort();
      this.transitionTo('expired');
    }

    else if (Ember.$.inArray(transition.targetName, openRoutes) === -1 && !this.get('session.user')) {
      Ember.Logger.info('Attempting to access protected route when not logged in. Aborting.');
      this.set('session.transition', transition);
      transition.abort();
      this.transitionTo('login');
    }

    else {

      // Only executed if you are logged in
      var ownerRoutes = ['wh.settings.team', 'wh.settings.general', 'wh.settings.billing', 'wh.settings.domain', 'wh.settings.data'];
      if (Ember.$.inArray(transition.targetName, ownerRoutes) !== -1 && !this.get('session.isOwner')) {
        Ember.Logger.info('Attempting to access protected route without permission. Aborting.');
        this.set('session.transition', transition);
        transition.abort();
        this.transitionTo('wh.index');
      }

    }

  }
});

Ember.TextField.reopen({
  attributeBindings: [ 'required' ]
});

// Ian doesn't like pluralizing, singularizing
Ember.Inflector.inflector.pluralize = function (string ) { return string; };
Ember.Inflector.inflector.singularize = function (string ) { return string; };

export default App;
