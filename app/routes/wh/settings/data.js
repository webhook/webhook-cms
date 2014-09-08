export default Ember.Route.extend({
  model: function () {

    var siteName = this.get('session.site.name');
    var siteToken = this.get('session.site.token');

    return new Ember.RSVP.Promise(function (resolve, reject) {
      var backupsRef = window.ENV.firebaseRoot.child('management/backups');
      backupsRef.once('value', function (snapshot) {

        var backups = Ember.$.map(snapshot.val() || [], function (timestamp) {
          return {
            fileName: siteName + '-' + moment(timestamp).format() + '.json',
            url: window.ENV.uploadUrl + 'backup-snapshot/?site=' + siteName + '&token=' + siteToken + '&timestamp=' + timestamp,
            timestamp: timestamp
          };
        });

        Ember.run(null, resolve, backups.reverse());
      });
    });
  },

  setupController: function (controller) {
    controller.set('deleteOption', 'data');
    controller.set('wordpressFile', null);

    controller.set('downloadLink', window.ENV.uploadUrl + 'download/?site=' +this.get('session.site.name') + '&token=' + this.get('session.site.token'));
    controller.set('downloadFileName', this.get('buildEnvironment').siteName);

    return this._super.apply(this, arguments);
  }
});
