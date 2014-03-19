export default Ember.ObjectController.extend({
  domain : "",

  isSending: false,
  success  : false,
  errors   : Ember.A([]),


  actions: {
    updateDns: function() {
      this.set('isSending', true);

      var domain = this.get('domain');
      var siteName = this.get('buildEnvironment').siteName;

      if(domain.indexOf('http://') === 0) {
        domain = domain.replace('http://');
      }

      window.ENV.firebaseRoot.child("management/sites/" + siteName + "/dns").set(domain, function() {
        var commandData = {
          dnsname: domain,
        };

        window.ENV.firebaseRoot.child("management/commands/dns/" + siteName).set(commandData, function() {
          this.set('success', true);
          this.set('isSending', false);
        }.bind(this));
      }.bind(this));
    }
  }
});
