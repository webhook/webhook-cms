// By adding Raygun via javascript we can control it better.
export default {
  name: 'raygun',

  initialize: function (container, application) {
    window.trackingInfo = {};

    window.trackingInfo.selfHosted = window.ENV.selfHosted;

    window.trackingInfo.x_console = [];
    window.trackingInfo.x_ajax = [];

    // Track hosted errors only
    if (window.ENV.isDevelopment || window.ENV.selfHosted) {
      return;
    }

    if(window.Raygun) {
      window.Raygun.init('wsX+OdSk4B61TUjygEwg1Q==', {
        allowInsecureSubmissions: true,
        ignoreAjaxAbort: true,
        ignore3rdPartyErrors: true,
        wrapAsynchronousCallbacks: true
      }).attach().whitelistCrossOriginDomains(["webhook.com"]).withCustomData(window.trackingInfo);

      window.Raygun.onBeforeSend(function(payload) {
        payload.Details.UserCustomData.hash = location.hash;

        if(payload.Details.UserCustomData.statusText)  { // AJAX ERROR, ABORT
          return false;
        } 

        return payload;
      });

      // Hook into ember logger to provide more information on errors
      ['debug', 'error', 'info', 'log', 'warn'].forEach(function(method) {
        var oldDebug = Ember.Logger[method];

        Ember.Logger[method] = function() {
          window.trackingInfo.x_console.push({ method: method, args: Array.prototype.slice.call(arguments) });

          if(window.trackingInfo.x_console.length > 30) {
            window.trackingInfo.x_console.shift();
          }

          oldDebug.apply(Ember.Logger, arguments);
        };
      });

      // Hook into ajaxComplete event to provide more information on errors
      $(document).ajaxComplete(function(evt, xhr, settings) {
        window.trackingInfo.x_ajax.push({ url: settings.url, status: xhr.status });

        if(window.trackingInfo.x_ajax.length > 30) {
          window.trackingInfo.x_ajax.shift();
        }
      });
    }
  }
};
