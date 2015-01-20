// By adding track.js via javascript we can control it better.
export default {
  name: 'trackjs',

  initialize: function (container, application) {

    // Clear out the old embedded version linked to from index.html
    window.trackJs = null;

    // Track hosted errors only
    if (window.ENV.selfHosted) {
      return;
    }

    // Figure out path to static assets
    var trackerPath = (function () {
      var links = document.getElementsByTagName('link'),
      leafletRe = /[\/^]app[\-\._]?([\w\-\._]*)\.css\??/;

      var i, len, href, matches, path;

      for (i = 0, len = links.length; i < len; i++) {
        href = links[i].href;
        matches = href.match(leafletRe);

        if (matches) {
          path = href.split(leafletRe)[0];
          return (path ? path + '/' : '') + 'javascript/tracker.js';
        }
      }
    }());

    application.deferReadiness();

    window._trackJs = {
      token: '2ec590caf8d5471a9514fd30e698cea6'
    };

    (function(d, script) {
      script = d.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.onload = function(){
        application.advanceReadiness();
      };
      script.onerror = function(){
        application.advanceReadiness();
      };
      script.src = trackerPath;
      d.getElementsByTagName('head')[0].appendChild(script);
    }(document));

  }
};
