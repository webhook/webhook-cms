export default Ember.Route.extend({
  notifications: [],

  setupController: function (controller) {
    controller.set('notifications', this.get('notifications'));
    this._super.apply(this, arguments);
  },

  userChanged: function () {

    // if you just logged in, we have to set the firebase property
    DS.FirebaseAdapter.reopen({
      firebase: window.ENV.firebase
    });

    if (this.get('session.transition')) {
      this.get('session.transition').retry();
    } else {
      this.transitionTo('index');
    }

  }.observes('session.user'),

  actions: {
    logoutUser: function () {

      window.ENV.firebase.child('presence/online').child(this.get('session.user.uid')).remove();

      this.get('session.auth').logout();
      this.transitionTo('login');
    },
    notify: function (type, message, options) {

      options = options || {};

      var notifications = this.get('notifications'),
          notification = Ember.Object.create({
            className: 'wy-tray-item' + (type ? '-' + type : ''),
            message: message
          });

      if (options.icon) {
        notification.set('iconClass', 'icon icon-' + options.icon);
      }

      if (options.className) {
        notification.set('extraClassName', options.className);
      }

      notifications.pushObject(notification);

      Ember.run.later(this, function () {
        notification.set('state', 'on');
      }, 10);

      Ember.run.later(this, function () {
        notification.set('state', null);
      }, 4500);

      Ember.run.later(this, function () {
        notifications.removeObject(notification);
      }, 5000);

    }
  }
});
