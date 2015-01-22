export default Ember.Controller.extend({
  serverMessages: Ember.A([]),

  serverMessagesPerPage: 10,

  contentTypes: null,
  settings: null,
  isEditingMessage: false,

  noTypesLive: function () {
    return Ember.isEmpty(this.get('contentTypes')) && !this.get('buildEnvironment.local');
  }.property('contentTypes.length', 'buildEnvironment.local'),

  moreServerMessages: function () {
    return this.get('session.serverMessages.length') === 10;
  }.property('session.serverMessages.@each'),

  init: function () {
    // the ref to management/sites/<sitename> should probably be stored somewhere
    var siteName = Ember.$('meta[name="siteName"]').attr('content');
    this.set('messageRef', window.ENV.firebaseRoot.child('/management/sites/' + siteName + '/messages'));

    var messagePage = this.get('messageRef').limitToLast(this.get('serverMessagesPerPage'));

    var controller = this;

    messagePage.on('child_added', function (snapshot) {
      var message = Ember.$.extend({}, snapshot.val(), { id: snapshot.key() });

      // We want to see if the website has ever been deployed
      if (typeof message.status !== 'undefined' && message.status === 0) {
        controller.set('session.isDeployed', true);
      }

      controller.getWithDefault('session.serverMessages', Ember.A([])).insertAt(0, message);
    });

  },

  actions: {
    moreServerMessages: function () {

      var serverMessages = this.get('session.serverMessages'),
          endAt = serverMessages.get('lastObject.id'),
          lastIndex = serverMessages.get('length');

      this.get('messageRef').endAt(null, endAt).once('value', function (snapshot) {
        var vals = snapshot.val() || {};
        delete vals[endAt];
        Ember.$.each(vals, function (name, message) {
          Ember.$.extend(message, { id: name });
          serverMessages.insertAt(lastIndex, message);
        });
      });

    },
    editMessage: function () {
      this.set('isEditingMessage', true);
    },
    saveMessage: function () {

      var controller = this;
      this.get('settings').save().then(function () {
        controller.set('isEditingMessage', false);
      });

    },
    cancelMessage: function () {
      this.get('settings').rollback();

      if (Ember.isEmpty(this.get('settings.siteMessage'))) {
        this.set('settings.siteMessage', this.get('defaultMessage'));
      }

      this.set('isEditingMessage', false);
    }
  }

});
