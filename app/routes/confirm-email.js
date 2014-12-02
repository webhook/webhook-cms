export default Ember.Route.extend({
  setupController: function (controller) {

    function getURLParameter(name) {
      return decodeURI(
        ((new RegExp(name + '=' + '(.+?)(&|$)')).exec(location.hash)||[,''])[1]
        );
    }

    var username = getURLParameter('username');
    var key = getURLParameter('key');

    if(!username || !key) {
      controller.setProperties({
        isSending: false,
        error: {
          code: 'NOPE',
          message: 'NEED TO SET KEY AND USERNAME'
        }
      });
    } else {
      var root = window.ENV.firebaseRoot.child('management/users/' + username + '/verification');

      root.child('verified').once('value', function(snapshot) {
        var val = snapshot.val();

        if(val) {
          controller.setProperties({
            isSending: false,
            success: true
          });

          setTimeout(function() {
            this.transitionTo('login');
          }.bind(this), 1000);
        } else {
          root.set({ verification_key_match: key, verified: true }, function(err) {
            if(err) {
              controller.setProperties({
                isSending: false,
                error: {
                  code: 'NOPE',
                  message: 'Invalid key or username'
                }
              });
            } else {
              controller.setProperties({
                isSending: false,
                success: true
              });

              setTimeout(function() {
                this.transitionTo('login');
              }.bind(this), 1000);
            }
          }.bind(this));
        }

      }.bind(this));
    }
  }
});
