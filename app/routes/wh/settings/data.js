export default Ember.Route.extend({
  model: function () {

    var siteName = this.get('session.site.name');
    var siteToken = this.get('session.site.token');

    return new Ember.RSVP.Promise(function (resolve, reject) {
      var backupsRef = window.ENV.firebaseRoot.child('management/backups');
      backupsRef.once('value', function (backups) {
        var backupsArray = Ember.$.map(backups.val(), function (timestamp) {
          return {
            // when the download attribute is better supported we can use this.
            // fileName: siteName + '-' + moment(timestamp).format() + '.json,
            url: 'http://server.webhook.com:3000/backup-snapshot/?site=' + siteName + '&token=' + siteToken + '&timestamp=' + timestamp,
            timestamp: timestamp
          };
        });
        Ember.run(null, resolve, backupsArray);
      });
    });
  }
});
