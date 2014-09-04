export default {
  name: 'environment',

  initialize: function (container, application) {
    application.deferReadiness();

    var self     = this,
        buildEnv = Ember.Object.create();

    application.register('build-environment:environment:current', buildEnv, { instantiate: false, singleton: true });
    Ember.A(['model', 'controller', 'view', 'route', 'helper', 'component']).forEach(function (component) {
      application.inject(component, 'buildEnvironment', 'build-environment:environment:current');
    });

    var isLocal     = false;
    var localSocket = null;
    var keepReload  = Ember.$('meta[name="keepReload"]').attr('content');

    var req = new XMLHttpRequest();
    req.open('GET', document.location, false);
    req.send(null);
    var headers = req.getAllResponseHeaders().toLowerCase();

    if (headers.indexOf('x-webhook-local') !== -1)
    {
      isLocal = true;
      localSocket = Ember.Object.create({
        socket        : new window.WebSocket('ws://' + document.location.hostname + ':6557'),
        doneCallback  : null,
        connected     : false,
        lostConnection: false,
        message       : '',
      });

      localSocket.socket.onmessage = function (event) {
        var storedCallback;
        if (event.data === 'done') {
          storedCallback = localSocket.get('doneCallback');
          localSocket.set('doneCallback', null);

          if (storedCallback) {
            storedCallback();
          }
        } else if (event.data.indexOf('done:') === 0) {
          var data = JSON.parse(event.data.replace('done:', ''));

          storedCallback = localSocket.get('doneCallback');
          localSocket.set('doneCallback', null);

          if (storedCallback) {
            storedCallback(data);
          }
        } else if (event.data.indexOf('message:') === 0) {
          var message = JSON.parse(event.data.replace('message:', ''));
          localSocket.set('message', message);
        }
      };

      localSocket.socket.onopen = function () {
        localSocket.set('connected', true);
      };

      if (!$('meta[name=suppressAlert]').attr('content')) {
        localSocket.socket.onclose = function () {
          localSocket.set('connected', false);
          localSocket.set('lostConnection', true);
        };
      }

      // Shut down LiveReload
      if (window.LiveReload && !keepReload) {
        var shutDown = new CustomEvent('LiveReloadShutDown');
        document.addEventListener("LiveReloadConnect", function () {
          document.dispatchEvent(shutDown);
        }, false);
      }
    }

    var siteName = Ember.$('meta[name="siteName"]').attr('content');
    buildEnv.set('local', isLocal);
    buildEnv.set('localSocket', localSocket);
    buildEnv.set('siteName', siteName);
    buildEnv.set('siteUrl', 'http://' + siteName + '.webhook.com/');
    buildEnv.set('building', false);
    buildEnv.set('selfHosted', window.ENV.selfHosted);

    window.ENV.siteDNS = siteName + '.webhook.org';
    window.ENV.firebaseRoot.child('/management/sites/' + siteName + '/dns').on('value', function (snap) {
      if (snap.val()) {
        window.ENV.siteDNS = snap.val();
      }
    });

    application.set('buildEnvironment', buildEnv);

    if (window.ENV.uploadUrl.indexOf('http://') !== 0) {
      window.ENV.uploadUrl = 'http://' + window.ENV.uploadUrl;
    }
    if (window.ENV.uploadUrl.substr(-1) !== '/') {
      window.ENV.uploadUrl = window.ENV.uploadUrl + '/';
    }

    Ember.run(application, application.advanceReadiness);
  }
};
