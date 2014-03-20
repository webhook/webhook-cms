export default Ember.Controller.extend({
  actions: {
    download: function () {
      window.ENV.firebase.once('value', function (snapshot) {
        var data = snapshot.val();

        // we don't need presence data.
        if (data.presence) {
          delete data.presence;
        }

        var blob = new window.Blob([JSON.stringify(data, null, 2)], {type: "text/plain;charset=utf-8"});
        window.saveAs(blob, moment().format() + '.json');
      });
    }
  }
});
