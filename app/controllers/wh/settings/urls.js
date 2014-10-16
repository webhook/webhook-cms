export default Ember.ArrayController.extend({

  sortProperties: ['priority'],

  // always have one row to manipulate
  generateFirst: function () {
    if (!this.get('content.length')) {
      this.store.createRecord('redirect');
    }
  }.observes('content.@each'),

  actions: {
    addRedirect: function () {
      this.store.createRecord('redirect', { priority: this.get('content.length') });
    },

    saveRedirects: function () {
      this.get('model').forEach(function (redirect) {
        redirect.save().then(function (redirect) {
          window.ENV.firebase.child('settings/redirect').child(redirect.get('id')).setPriority(redirect.get('priority'));
        });
      });
    },

    removeRedirect: function (redirect) {
      redirect.destroyRecord();
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
