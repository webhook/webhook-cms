/*globals jQuery*/
// By adding Raygun via javascript we can control it better.
export default {
  name: 'raygun',

  initialize: function (container, application) {
    window.trackingInfo = {};

    window.trackingInfo.selfHosted = window.ENV.selfHosted;

    window.trackingInfo.xtra_info = [];

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
      }).attach().whitelistCrossOriginDomains(["webhook.com"]).withCustomData(window.trackingInfo).withTags(function() {
        return [window.trackingInfo.siteName];
      });

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
          var args = Array.prototype.slice.call(arguments);

          var compiledString = method.toUpperCase() + '   ';
          args.forEach(function(ar) {
            if(typeof ar === 'object') {
              compiledString += JSON.stringify(ar) + ' ';
            } else {
              compiledString += ar + ' ';
            }
          });

          window.trackingInfo.xtra_info.unshift(compiledString);

          if(window.trackingInfo.xtra_info.length > 50) {
            window.trackingInfo.xtra_info.pop();
          }

          oldDebug.apply(Ember.Logger, arguments);
        };
      });

      if(jQuery) {
        // Hook into ajaxComplete event to provide more information on errors
        $(document).ajaxComplete(function(evt, xhr, settings) {
          window.trackingInfo.xtra_info.unshift(xhr.status + '   ' + xhr.statusText + '  ' + settings.url);

          if(window.trackingInfo.xtra_info.length > 50) {
            window.trackingInfo.xtra_info.pop();
          }
        });
      }
    }
  }
};
