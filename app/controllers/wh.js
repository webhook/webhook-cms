export default Ember.ArrayController.extend({
  sortProperties: ['name'],
  searchQuery:   '',

  init: function () {

    var user = this.get('session.user');

    // Presence
    var presenceRef   = window.ENV.firebase.child('presence'),
        onlineRef     = presenceRef.child('online'),
        userRef       = onlineRef.child(user.uid),
        lastOnlineRef = presenceRef.child('lastOnline/' + user.uid);

    userRef.set(user.email);

    // when I disconnect, remove user presence
    userRef.onDisconnect().remove();

    // when I disconnect, update the last time I was seen online
    lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);

    this.addObserver('session.user', function () {
      if (this.get('session.user')) {
        userRef.set(user.email);
      }
    });

    // Keep track of who is online.
    this.set('onlineUsers', Ember.A([]));

    onlineRef.on('child_added', function (snapshot) {
      this.get('onlineUsers').pushObject(snapshot.val());
    }.bind(this));

    onlineRef.on('child_removed', function (snapshot) {
      this.get('onlineUsers').removeObject(snapshot.val());
    }.bind(this));

  },

  actions: {
    searchGlobal: function () {
      this.transitionToRoute('wh.search-global-results');
    },
  }

});
