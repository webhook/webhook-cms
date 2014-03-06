export default Ember.Route.extend({
  setupController: function (controller) {

    function getURLParameter(name) {
      return decodeURI(
        ((new RegExp(name + '=' + '(.+?)(&|$)')).exec(location.hash)||[,''])[1]
        );
    }

    var username = getURLParameter('username') || null;
    var key = getURLParameter('key') || null;

    controller.setProperties({
      email    : username,
      verification_key: key,
      password : "",
      password2: "",
      isSending: false,
      success  : false,
      error    : null
    });
  }
});
