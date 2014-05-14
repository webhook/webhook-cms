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

      function uniqueId() {
        return Date.now() + 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
        }); 
      }

      window.ENV.firebaseRoot.child("management/sites/" + siteName + "/dns").set(domain, function() {
        var commandData = {
          dnsname: domain,
          id: uniqueId()
        };

        window.ENV.firebaseRoot.child("management/commands/dns/" + siteName).set(commandData, function() {
          this.set('success', true);
          this.set('isSending', false);
        }.bind(this));
      }.bind(this));
    }
  }
});
