import Resolver from 'resolver';

var App = Ember.Application.extend({
  LOG_ACTIVE_GENERATION: true,
  LOG_MODULE_RESOLVER: true,
  LOG_TRANSITIONS: true,
  LOG_TRANSITIONS_INTERNAL: true,
  LOG_VIEW_LOOKUPS: true,
  modulePrefix: 'appkit', // TODO: loaded via config
  Resolver: Resolver['default'],
  init: function () {
    window.console.log(window.ENV);
    this._super.apply(this, arguments);
  }
});

// This helps ember-validations not blow up
// https://github.com/dockyard/ember-validations/issues/26#issuecomment-31877071
DS.Model.reopen({
  isValid: false
});

export default App;
