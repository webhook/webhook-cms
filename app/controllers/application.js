export default Ember.Controller.extend({
  userChanged: function () {

    if (this.get('session.user')) {

      var user = this.get('session.user');

      // Presence
      var presenceRef   = window.ENV.firebase.child('presence'),
          onlineRef     = presenceRef.child('online'),
          lastOnlineRef = presenceRef.child('lastOnline/' + user.uid),
          connectedRef  = window.ENV.firebaseRoot.child('.info/connected');

      connectedRef.once('value', function (snap) {
        if (snap.val() === true) {
          // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)

          // add user to connection list
          var userRef = onlineRef.child(user.uid);
          userRef.set(user.email);

          // when I disconnect, remove this device
          userRef.onDisconnect().remove();

          // when I disconnect, update the last time I was seen online
          lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);

        }
      });

      this.set('onlineUsers', Ember.A([]));

      onlineRef.on('child_added', function (snapshot) {
        this.get('onlineUsers').pushObject(snapshot.val());
      }.bind(this));

      onlineRef.on('child_removed', function (snapshot) {
        this.get('onlineUsers').removeObject(snapshot.val());
      }.bind(this));

    }
  }.observes('session').on('init'),
});
