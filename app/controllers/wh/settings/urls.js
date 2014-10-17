export default Ember.ArrayController.extend({

  sortProperties: ['priority'],

  isSaving: false,

  removedRedirects: Ember.A([]),

  // always have one row to manipulate
  generateFirst: function () {
    if (!this.get('content.length')) {
      this.store.createRecord('redirect', { priority: 0 });
    }
  }.observes('content.@each'),

  isDirty: function () {
    return this.get('content').isAny('isDirty') || !Ember.isEmpty(this.get('removedRedirects'));
  }.property('content.@each.isDirty'),

  isSaveDisabled: function () {
    return this.get('isSaving') || !this.get('isDirty');
  }.property('isDirty', 'isSaving'),

  actions: {
    addRedirect: function () {
      this.store.createRecord('redirect', { priority: this.get('content.length') });
    },

    saveRedirects: function () {

      var controller = this;
      controller.set('isSaving', true);

      // Save redirect rules with ordering (priority)
      var redirectUpdates = this.get('model').map(function (redirect) {
        return redirect.save().then(function (redirect) {
          return new Ember.RSVP.Promise(function (resolve, reject) {
            window.ENV.firebase.child('settings/redirect').child(redirect.get('id')).setPriority(redirect.get('priority'), function (error) {
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            });
          });
        });
      });

      Ember.RSVP.Promise.all(redirectUpdates).then(function () {

        if (controller.get('domain')) {
          // only send signal if domain is set
          return new Ember.RSVP.Promise(function (resolve, reject) {

            // Should probably put this somewhere. :)
            function uniqueId() {
              return Date.now() + 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
              });
            }

            window.ENV.firebaseRoot.child("management/commands/dns/" + controller.get('buildEnvironment.siteName')).set({
              dnsname: controller.get('domain'),
              id: uniqueId()
            }, function(error) {
              if (error) {
                reject(error);
              } else {
                resolve(['Redirect rules saved.', 'Worker signaled.']);
              }
            });

          });
        } else {
          return Ember.RSVP.Promise.resolve(['Redirect rules saved.']);
        }

      }).then(function (messages) {

        controller.set('isSaving', false);
        messages.forEach(function (message) {
          controller.send('notify', 'success', message);
        });

      });

    },

    removeRedirect: function (redirect) {
      redirect.deleteRecord();
      this.get('removedRedirects').addObject(redirect);
    },

    moveUp: function (redirect) {

      var originalPriority = redirect.get('priority');
      var targetPriority = redirect.get('priority') - 1;

      this.get('content').forEach(function (redirect, index) {

        if (index >= targetPriority && index <= originalPriority) {
          redirect.incrementProperty('priority');
        }

      });

      redirect.set('priority', targetPriority);

    },

    moveDown: function (redirect) {

      var originalPriority = redirect.get('priority');
      var targetPriority = redirect.get('priority') + 1;

      this.get('content').forEach(function (redirect, index) {

        if (index >= originalPriority && index <= targetPriority) {
          redirect.decrementProperty('priority');
        }

      });

      redirect.set('priority', targetPriority);

    }
  }

});
