var listener = null;
var setupMessageListener = function(siteName, buildEnv) {
  var ref = window.ENV.firebase.root().child('management/sites/' + siteName + '/messages');
  if(listener) {
    ref.off('child_added', listener);
    listener = null;
  }

  var initialIds = {};
  ref.once('value', function(totalData) {
    var val = totalData.val();

    for(var key in val) {
      initialIds[key] = true;
    }

    listener = ref.on('child_added', function(snap) {
      var now = Date.now();
      var message = snap.val();
      var id = snap.name();

      if(!initialIds[id]) {
        if(message.code === 'BUILD') {
          if(message.status === 0) {
            window.ENV.notify('success', 'Site build complete', { icon: 'refresh' });
          } else {
            window.ENV.notify('danger', 'Site build failed', { icon: 'remove' });
          }
          buildEnv.set('building', false);
        }
      }
    });
  });
};

export default {
  name: 'login',

  initialize: function (container, application) {

    application.deferReadiness();

    var self     = this,
        siteName = Ember.$('meta[name="siteName"]').attr('content'),
        session = Ember.Object.create(),
        bucket = '';

    // Add `session` to all the things
    application.register('firebase-simple-login:session:current', session, { instantiate: false, singleton: true });
    Ember.A(['model', 'controller', 'view', 'route', 'component']).forEach(function (component) {
      application.inject(component, 'session', 'firebase-simple-login:session:current');
    });

    var managementSiteRef = window.ENV.firebaseRoot.child('management/sites/' + siteName);

    var firebaseAuth = new FirebaseSimpleLogin(window.ENV.firebaseRoot, function (error, user) {

      var initializeUser = function(snapshot) {
        bucket = snapshot.val();

        window.ENV.firebase = window.ENV.firebaseRoot.child('buckets/' + siteName + '/' + bucket + '/dev');

        // if you just logged in, we have to set the firebase property
        DS.FirebaseAdapter.reopen({
          firebase: window.ENV.firebase
        });

        if (application.get('buildEnvironment').local === false) {
          setupMessageListener(siteName, application.get('buildEnvironment'));
        }

        session.set('error', null);
        session.set('site', {
          name : siteName,
          token: bucket
        });

        Ember.Logger.info('Logged in as ' + user.email);

        var escapedEmail = user.email.replace(/\./g, ',1');

        var ownerCheck = new Ember.RSVP.Promise(function (resolve, reject) {
          session.set('isOwner', false);
          managementSiteRef.on('value', function (snapshot) {
            var siteData = snapshot.val();

            if (siteData.owners[escapedEmail]) {
              Ember.Logger.info('Logged in user is a site owner.');
              session.set('isOwner', true);
            } else if (siteData.users[escapedEmail]) {
              Ember.Logger.info('Logged in user is a site user.');
            } else {
              Ember.Logger.error('Logged in user is neither a site owner or site user??');
            }

            Ember.run(null, resolve);

          });
        });

        // Default billing values
        var billing = Ember.Object.create({
          active: true,
          status: 'paid',
          url: 'http://billing.webhook.com/site/' + siteName + '/',
        });
        billing.reopen({
          isPaid: function () {
            return this.get('status') === 'paid';
          }.property('status'),
          isTrial: function () {
            return this.get('status') === 'trialing';
          }.property('status')
        });
        session.set('billing', billing);

        // Grab actual billing values
        var billingRef = window.ENV.firebaseRoot.child('billing/sites/' + siteName);

        var activeCheck = new Ember.RSVP.Promise(function (resolve, reject) {
          billingRef.child('active').on('value', function (snapshot) {
            session.set('billing.active', snapshot.val());
            Ember.run(null, resolve);
          });
        });

        var statusCheck = new Ember.RSVP.Promise(function (resolve, reject) {
          billingRef.child('status').on('value', function (snapshot) {
            session.set('billing.status', snapshot.val());
            Ember.run(null, resolve);
          });
        });

        var endTrialCheck = new Ember.RSVP.Promise(function (resolve, reject) {
          billingRef.child('endTrial').on('value', function (snapshot) {
            var endTrial = snapshot.val();
            if (endTrial) {
              var endTrialDays = Math.ceil(moment(snapshot.val()).diff(moment(), 'days', true));
              session.set('billing.endTrial', endTrial);
              session.set('billing.endTrialDays', endTrialDays);
              session.set('billing.endTrialIsLastDay', endTrialDays === 1);
            }
            Ember.run(null, resolve);
          });
        });

        var serverMessagesCheck = new Ember.RSVP.Promise(function (resolve, reject) {

          session.set('supportedMessages', Ember.Object.create());

          // Skip if we're not connected to generate server (ie: developing cms)
          var localSocket = application.get('buildEnvironment').localSocket;
          if (!localSocket || !localSocket.connected) {
            return resolve();
          }

          window.ENV.sendGruntCommand('supported_messages', function (messages) {
            if (messages && Ember.isArray(messages)) {
              messages.forEach(function (message) {
                session.get('supportedMessages').set(message, true);
              });
              Ember.Logger.info('Server Messages Supported:', messages.join(', '));
            }
            resolve();
          });

        });

        Ember.RSVP.Promise.all([ownerCheck, activeCheck, statusCheck, endTrialCheck, serverMessagesCheck]).then(function () {
          session.set('user', user);
          Ember.Logger.log('Setting billing info to', session.get('billing'));
          Ember.run(application, application.advanceReadiness);
        });

      };

      if (error) {
        // an error occurred while attempting login
        session.set('error', error);
        Ember.run(application, application.advanceReadiness);
      } else if (user) {

        managementSiteRef.child('key').once('value', initializeUser, function (error) {

          if (error.code === 'PERMISSION_DENIED') {
            var escapedEmail = user.email.replace(/\./g, ',1');
            // Try to add to user list, if this is allowed they were a potential user
            managementSiteRef.child('users').child(escapedEmail).set(user.email, function (error) {
              if (error) {
                session.get('auth').logout();
                session.set('error', error);
                Ember.run(application, application.advanceReadiness);
              } else {
                managementSiteRef.root().child('management/users').child(escapedEmail).child('sites/user').child(siteName).set(true, function (error) {
                  // Try to delete self from potential user list
                  managementSiteRef.child('potential_users').child(escapedEmail).remove(function (error) {
                    if (error) {
                      session.get('auth').logout();
                      session.set('error', error);
                      Ember.run(application, application.advanceReadiness);
                    } else {
                      // Redo original authorization call
                      managementSiteRef.child('key').once('value', initializeUser, function (error) {
                        if (error) {
                          session.get('auth').logout();
                          session.set('error', error);
                        }
                        Ember.run(application, application.advanceReadiness);
                      });
                    }
                  });
                });
              }
            });
            // User may be a potential, try and elevate to user
          } else {
            session.get('auth').logout();
            session.set('error', error);
            Ember.run(application, application.advanceReadiness);
          }

        });

      } else {
        // user is logged out
        session.set('user', null);
        session.set('site', null);
        Ember.run(application, application.advanceReadiness);
      }
    });

    session.set('auth', firebaseAuth);

    window.ENV.search = function(query, page, typeName, callback) {
      var site = siteName;
      var key = bucket;

      if(typeof typeName === 'function') {
        callback = typeName;
        typeName = null;
      }

      Ember.$.ajax({
        url: 'http://server.webhook.com/search/',
        type: 'POST',
        data: {
          token: key,
          site: site,
          query: query,
          page: page,
          typeName: typeName
        },
        success: function(data, status, xhr) {

          if(data.error) {
            callback(data.error, []);
          } else if (!data.hits) {
            callback('NO IDEA', []);
          } else {
            var items = [];
            Ember.$.each(data.hits, function(index, value) {
              var highlights = [];

              var name = value.fields.name ? value.fields.name[0] : '';

              if(value.highlight) {
                for(var key in value.highlight) {
                  if(key === 'name') {
                    name = value.highlight[key][0];
                  } else {
                    highlights.push({ key: key, highlight: value.highlight[key][0] });
                  }
                }
              }

              items.push({
                name: name,
                oneOff: value.fields.__oneOff ? (value.fields.__oneOff[0] === "true" ? true : false ): false,
                id: value._id,
                type: value._type,
                highlights: highlights
              });
            });

            callback(null, items);
          }
        },
        error: function(xhr, status, error) {
          callback(error, []);
        }
      });
    };

    window.ENV.indexItem = function(id, data, oneOff, typeName) {
      var site = siteName;
      var key = bucket;

      Ember.Logger.info('Updating search index for', typeName, id);

      Ember.$.ajax({
        url: 'http://server.webhook.com/search/index/',
        type: 'POST',
        data: {
          id: id,
          token: key,
          site: site,
          data: JSON.stringify(data),
          typeName: typeName,
          oneOff: oneOff
        }
      }).done(function () {
        Ember.Logger.info('Search index updated for', typeName, id);
      }).fail(function (jqXHR, textStatus, error) {
        Ember.Logger.error(error);
      });
    };

    window.ENV.deleteIndex = function(id, typeName) {
      var site = siteName;
      var key = bucket;

      Ember.$.ajax({
        url: 'http://server.webhook.com/search/delete/',
        type: 'POST',
        data: {
          id: id,
          token: key,
          site: site,
          typeName: typeName
        },
        success: function(data, status, xhr) {
        }
      });
    };

    window.ENV.deleteTypeIndex = function(typeName) {
      var site = siteName;
      var key = bucket;

      Ember.$.ajax({
        url: 'http://server.webhook.com/search/delete/type/',
        type: 'POST',
        data: {
          token: key,
          site: site,
          typeName: typeName
        },
        success: function(data, status, xhr) {
        }
      });
    };

    // just passes on args to notify action
    window.ENV.notify = function() {
      var route = application.__container__.lookup('route:application');
      var args = Array.prototype.slice.call(arguments);
      args.unshift('notify');

      route.send.apply(route, args);
    };

    function uniqueId() {
      return Date.now() + 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
    }

    window.ENV.sendBuildSignal = function (publish_date) {

      Ember.Logger.info('Sending build signal:', publish_date || 'No publish date.');

      var user = session.get('user.email');

      if (application.get('buildEnvironment').local === false) {

        var data = {
          'userid': user,
          'sitename': siteName,
          'id': uniqueId()
        };

        if (publish_date) {
          data.build_time = publish_date;
        }

        window.ENV.firebase.root().child('management/commands/build/' + siteName).set(data, function () {});
        application.get('buildEnvironment').set('building', true);
      } else {
        window.ENV.sendGruntCommand('build', function () {
          window.ENV.notify('success', 'Local build complete', { icon: 'refresh' });
        });
      }
    };

    window.ENV.sendGruntCommand = function (command, callback) {
      Ember.Logger.log('%csendGruntCommand -> ' + command, 'color: purple; font-weight: bold');
      var localSocket = application.get('buildEnvironment').localSocket;
      if (localSocket && localSocket.connected) {
        localSocket.socket.send(command);
        if (callback) {
          localSocket.doneCallback = callback;
        }
      }
    };
  }
};
