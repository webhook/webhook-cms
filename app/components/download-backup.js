export default Ember.Component.extend({
  tagName: 'button',
  classNames: ['btn'],

  text: 'Download Backup',

  click: function () {
    var fileName = this.get('buildEnvironment.siteDisplayName') + '-' + moment().format() + '.json';
    window.ENV.firebase.once('value', function (snapshot) {
      var data = snapshot.val();

      var dataWhiteList = {
        contentType: data.contentType,
        data: data.data,
        settings: data.settings
      };

      var blob = new window.Blob([JSON.stringify(dataWhiteList, null, 2)], { type: "text/plain;charset=utf-8" });
      window.saveAs(blob, fileName);
    });
  }
});
