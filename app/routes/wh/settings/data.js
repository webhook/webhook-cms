export default Ember.Route.extend({
  model: function () {

    var siteName = this.get('session.site.name');
    var siteToken = this.get('session.site.token');

    return new Ember.RSVP.Promise(function (resolve, reject) {
      var backupsRef = window.ENV.firebaseRoot.child('management/backups');
      backupsRef.once('value', function (snapshot) {
        var backups = Ember.$.map(snapshot.val(), function (timestamp) {
          return {
            fileName: siteName + '-' + moment(timestamp).format() + '.json',
            url: 'http://server.webhook.com/backup-snapshot/?site=' + siteName + '&token=' + siteToken + '&timestamp=' + timestamp,
            timestamp: timestamp
          };
        });
        Ember.run(null, resolve, backups.reverse());
      });
    });
  }
});
