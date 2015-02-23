export default Ember.ArrayController.extend({

  sortProperties: ['priority'],

  isSaving: false,
  forceEnableSave: false,

  removedRules: Ember.A([]),

  isAnyInvalid: function () {
    return this.get('content').isAny('isValid', false);
  }.property('content.@each.isValid'),

  // always have one row to manipulate
  generateFirst: function () {
    if (!this.get('content.length')) {
      this.store.createRecord('redirect', { priority: 0 });
    }
  }.observes('content.@each'),

  isReordered: function () {
    return this.get('content').filter(function (redirect, index) {
      return redirect.get('priority') !== index;
    }).get('length');
  }.property('content.@each.priority'),

  isDirty: function () {
    return this.get('content').isAny('isDirty') || this.get('isReordered') || this.get('removedRules.length');
  }.property('content.@each.isDirty', 'isReordered', 'removedRules.@each'),

  isSaveDisabled: function () {
    if (this.get('forceEnableSave')) {
      return false;
    }

    if (this.get('isAnyInvalid')) {
      return true;
    }

    return this.get('isSaving') || !this.get('isDirty');
  }.property('isDirty', 'isSaving', 'isAnyInvalid'),

  moveRule: function (originalPriority, targetPriority) {

    var redirect = this.get('content').findBy('priority', originalPriority);

    this.get('content').forEach(function (redirect, index) {
      if (originalPriority > targetPriority) {
        if (index >= targetPriority && index <= originalPriority) {
          redirect.incrementProperty('priority');
        }
      } else {
        if (index >= originalPriority && index <= targetPriority) {
          redirect.decrementProperty('priority');
        }
      }
    });

    redirect.set('priority', targetPriority);

  },

  actions: {
    addRedirect: function () {
      this.store.createRecord('redirect', { priority: this.get('content.length') });
    },

    removeRedirect: function (redirect) {
      redirect.deleteRecord();
      this.get('removedRules').pushObject(redirect);
    },

    saveRedirects: function () {

      var controller = this;
      var siteName = this.get('session.site.name');
      controller.set('isSaving', true);

      // Save redirect rules with ordering (priority)
      var redirectUpdates = this.get('model').map(function (redirect) {
        return redirect.save().then(function (redirect) {
          if (Ember.isEmpty(redirect.get('pattern')) || Ember.isEmpty(redirect.get('destination'))) {
            return Ember.RSVP.Promise.resolve();
          }
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

      // Save deletions
      var redirectRemovals = this.get('removedRules').map(function (redirect) {
        return redirect.save();
      });

      Ember.RSVP.Promise.all([redirectUpdates, redirectRemovals]).then(function () {

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

            var id = uniqueId();


            window.ENV.firebaseRoot.child("management/sites/" + siteName + "/dns-status/id").set(id, function() {
              window.ENV.firebaseRoot.child("management/commands/dns/" + controller.get('session.site.name')).set({
                dnsname: controller.get('domain'),
                id: id
              }, function(error) {
                if (error) {
                  reject(error);
                } else {
                  resolve(['Redirect rules saved.', 'Worker signaled.']);
                }
              });
            });
          });
        } else {
          return Ember.RSVP.Promise.resolve(['Redirect rules saved.']);
        }

      }).then(function (messages) {

        controller.set('forceEnableSave', false);
        controller.set('isSaving', false);
        controller.set('isRuleRemoved', false);
        messages.forEach(function (message) {
          controller.send('notify', 'success', message);
        });

      }).catch(function (error) {

        controller.set('forceEnableSave', true);
        controller.set('isSaving', false);
        controller.set('isRuleRemoved', false);
        controller.send('notify', 'danger', 'Error saving redirects. Try again.');
        Ember.Logger.error(error);

      });

    }
  }

});
