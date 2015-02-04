// By adding Raygun via javascript we can control it better.
export default {
  name: 'raygun',

  initialize: function (container, application) {

    window.Raygun = null;

    window.trackingInfo = {};

    window.trackingInfo.selfHosted = window.ENV.selfHosted;

    // Track hosted errors only
    if (window.ENV.isDevelopment || window.ENV.selfHosted) {
      return;
    }

    application.deferReadiness();

    (function(d, script) {
      script = d.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.onload = function(){
        if(window.Raygun) {
          window.Raygun.init('wsX+OdSk4B61TUjygEwg1Q==', {
            allowInsecureSubmissions: true,
            ignoreAjaxAbort: true,
            ignore3rdPartyErrors: true,
            wrapAsynchronousCallbacks: true
          }).attach().whitelistCrossOriginDomains(["webhook.com"]).withCustomData(window.trackingInfo);

          window.Raygun.onBeforeSend(function(payload) {
            payload.Details.UserCustomData.hash = location.hash;
            return payload;
          });
        }
        application.advanceReadiness();
      };
      script.onerror = function(){
        application.advanceReadiness();
      };
      script.src = 'http://cdn.raygun.io/raygun4js/raygun.min.js';
      d.getElementsByTagName('head')[0].appendChild(script);
    }(document));

  }
};
