export default Ember.ArrayController.extend({
  sortProperties: ['name'],

  init: function () {

    var user = this.get('session.user');

    // Presence
    var presenceRef   = window.ENV.firebase.child('presence'),
        onlineRef     = presenceRef.child('online'),
        userRef       = onlineRef.child(user.uid),
        lastOnlineRef = presenceRef.child('lastOnline/' + user.uid),
        connectedRef  = window.ENV.firebaseRoot.child('.info/connected');

    // when I disconnect, remove user presence
    userRef.onDisconnect().remove();

    // when I disconnect, update the last time I was seen online
    lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);

    connectedRef.on('value', function (snapshot) {
      if (snapshot.val() === true) {
        // when I connect, add user presence
        userRef.set(user.email);
      }
    });

    this.set('onlineUsers', Ember.A([]));

    onlineRef.on('child_added', function (snapshot) {
      this.get('onlineUsers').pushObject(snapshot.val());
    }.bind(this));

    onlineRef.on('child_removed', function (snapshot) {
      this.get('onlineUsers').removeObject(snapshot.val());
    }.bind(this));

    this.addObserver('session.user', function () {
      if (this.get('session.user')) {
        userRef.set(user.email);
      }
    });

  }

});
