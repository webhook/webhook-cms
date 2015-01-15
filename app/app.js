/*global hljs*/
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';

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

// Before any route, kick user to login if they aren't logged in
Ember.Route.reopen({
  beforeModel: function (transition) {

    // These routes you do not need to be logged in to access.
    var openRoutes = [
      'login',
      'password-reset',
      'create-user',
      'confirm-email',
      'resend-email',
      'expired'
    ];

    // Logged in, but account is inactive. Redirect to expired route.
    if (this.get('session.user') && this.get('session.billing.active') === false && transition.targetName !== 'expired') {
      Ember.Logger.warn('Site is not active, redirecting to expired route.');
      this.transitionTo('expired');
    }

    // Not logged in and attempting to access protected route, redirect to login.
    else if (Ember.$.inArray(transition.targetName, openRoutes) === -1 && !this.get('session.user')) {
      Ember.Logger.warn('Attempting to access protected route when not logged in. Aborting.');
      this.set('session.transition', transition);
      this.transitionTo('login');
    }

    else {

      // Routes that only site owners should be able to access.
      var ownerRoutes = [
        'wh.settings.team',
        'wh.settings.general',
        'wh.settings.billing',
        'wh.settings.domain',
        'wh.settings.data'
      ];

      // If not owner and trying to access an owner route, redirect to index.
      if (Ember.$.inArray(transition.targetName, ownerRoutes) !== -1 && !this.get('session.isOwner')) {
        Ember.Logger.warn('Attempting to access protected route without permission. Aborting.');
        this.set('session.transition', transition);
        this.transitionTo('wh.index');
      }

    }

  }
});

// Add translatable attributes to textfield.
Ember.TextField.reopen(Em.I18n.TranslateableAttributes);

// Ian doesn't like pluralizing, singularizing
Ember.Inflector.inflector.pluralize = function (string ) { return string; };
Ember.Inflector.inflector.singularize = function (string ) { return string; };

// Configure Marked
marked.setOptions({
  highlight: function (code) {
    return hljs.highlightAuto(code).value;
  }
});

export default App;
