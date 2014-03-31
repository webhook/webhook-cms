export default Ember.ArrayController.extend({
  serverMessages: Ember.A([]),

  serverMessagesPerPage: 10,

  moreServerMessages: function () {
    return this.get('serverMessages.length') === 10;
  }.property('serverMessages.@each'),

  init: function () {
    // the ref to management/sites/<sitename> should probably be stored somewhere
    var siteName = Ember.$('meta[name="siteName"]').attr('content');
    this.set('messageRef', window.ENV.firebaseRoot.child('/management/sites/' + siteName + '/messages'));

    var messagePage = this.get('messageRef').limit(this.get('serverMessagesPerPage'));

    messagePage.on('child_added', function (snapshot) {
      var message = Ember.$.extend({}, snapshot.val(), { id: snapshot.name() });
      this.get('serverMessages').insertAt(0, message);
    }.bind(this));

  },

  actions: {
    moreServerMessages: function () {

      var endAt = this.get('serverMessages.lastObject.id'),
          serverMessages = this.get('serverMessages'),
          lastIndex = serverMessages.get('length');

      this.get('messageRef').endAt(null, endAt).once('value', function (snapshot) {
        var vals = snapshot.val() || {};
        delete vals[endAt];
        Ember.$.each(vals, function (name, message) {
          Ember.$.extend(message, { id: name });
          serverMessages.insertAt(lastIndex, message);
        });
      });

    }
  }

});
