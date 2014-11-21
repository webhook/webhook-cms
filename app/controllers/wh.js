import SearchIndex from 'appkit/utils/search-index';

export default Ember.ArrayController.extend({
  sortProperties: ['name'],

  searchQuery: '',
  searchLoading: false,
  debouncedQuery: '',

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

    // Global search hotkey (s)
    Ember.$(document).on('keyup', function (event) {
      if (event.keyCode === 83 && event.target.nodeName === 'BODY') {
        Ember.Logger.info('Search hotkey pressed. Focus on search.');
        Ember.$('.wy-side-nav-search input').focus();
      }
    });

    this.set('session.serverMessages', Ember.A([]));

  },

  debouncedSearchQueryObserver: Ember.debouncedObserver(function() {

    if (!this.get('searchQuery')) {
      return;
    }

    this.set('debouncedQuery', this.get('searchQuery'));
    this.set('searchLoading', true);

    var controller = this;

    SearchIndex.search(this.get('searchQuery'), 1).then(function (results) {
      controller.set('searchResults', results);
      controller.set('searchLoading', false);
    }, function (error) {
      controller.set('searchResults', Ember.A([]));
      controller.set('searchLoading', false);
    });

  }, 'searchQuery', 200),

  searchQueryObserver: function () {
    Ember.$("[data-toggle='wy-nav-shift']").removeClass("shift");
    this.transitionToRoute('wh.search-global-results');
  }.observes('searchQuery')


});
