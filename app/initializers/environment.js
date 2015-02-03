// CustomEvent polyfill
if (!('CustomEvent' in window && typeof window.CustomEvent === 'function')) {

  Ember.Logger.log('Using CustomEvent polyfill');

  window.CustomEvent = function(
    eventName,
    defaultInitDict
  ){

    // the infamous substitute
    function CustomEvent(type, eventInitDict) {
      /*jshint eqnull:true */
      var event = document.createEvent(eventName);
      if (typeof type !== 'string') {
        throw new Error('An event name must be provided');
      }
      if (eventName === 'Event') {
        event.initCustomEvent = initCustomEvent;
      }
      if (eventInitDict == null) {
        eventInitDict = defaultInitDict;
      }
      event.initCustomEvent(
        type,
        eventInitDict.bubbles,
        eventInitDict.cancelable,
        eventInitDict.detail
      );
      return event;
    }

    // attached at runtime
    function initCustomEvent(
      type, bubbles, cancelable, detail
    ) {
      /*jshint validthis:true*/
      this.initEvent(type, bubbles, cancelable);
      this.detail = detail;
    }

    // that's it
    return CustomEvent;
  }(
    // is this IE9 or IE10 ?
    // where CustomEvent is there
    // but not usable as construtor ?
    window.CustomEvent ?
      // use the CustomEvent interface in such case
      'CustomEvent' : 'Event',
      // otherwise the common compatible one
    {
      bubbles: false,
      cancelable: false,
      detail: null
    }
  );
}

export default {
  name: 'environment',

  initialize: function (container, application) {

    var buildEnv = Ember.Object.create();

    application.register('environment:current', buildEnv, { instantiate: false, singleton: true });
    Ember.A(['model', 'controller', 'view', 'route', 'helper', 'component']).forEach(function (component) {
      application.inject(component, 'buildEnvironment', 'environment:current');
    });

    // Shut down LiveReload
    if (window.LiveReload && !Ember.$('meta[name="keepReload"]').attr('content')) {
      var shutDown = new window.CustomEvent('LiveReloadShutDown');
      document.addEventListener("LiveReloadConnect", function () {
        document.dispatchEvent(shutDown);
      }, false);
    }

  }
};
