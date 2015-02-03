// By adding track.js via javascript we can control it better.
export default {
  name: 'raygun',

  initialize: function (container, application) {

    // Clear out the old embedded version linked to from index.html
    window.Raygun = null;

    // Track hosted errors only
    /*if (window.ENV.isDevelopment || window.ENV.selfHosted) {
      return;
    }*/

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
            ignore3rdPartyErrors: false,
            wrapAsynchronousCallbacks: true
          }).attach();
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
