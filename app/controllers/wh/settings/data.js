export default Ember.Controller.extend({
  actions: {
    download: function () {
      window.ENV.firebase.child('data').once('value', function (snapshot) {
        var blob = new window.Blob([JSON.stringify(snapshot.val(), null, 2)], {type: "text/plain;charset=utf-8"});
        window.saveAs(blob, moment().format() + '.json');
      });
    }
  }
});
