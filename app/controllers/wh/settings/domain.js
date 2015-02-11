export default Ember.ObjectController.extend({
  domain : "",

  isSending: false,
  success  : false,
  errors    :  Ember.A([]),

  subdomain: function() {
    var parts = this.get('domain').split('.');

    if(parts.length < 3) {
      return false;
    }

/*    if(parts.length === 3 && parts[0] === 'www') {
      return false;
    }*/

    parts.pop();
    parts.pop();

    var domain = parts.join('.');

    domain = domain + Array(39 - domain.length+1).join(" ");
    return domain;
  }.property('domain'),

  showRedirector: function() {
    var parts = this.get('domain').split('.');

    if(parts.length < 3) {
      return false;
    }

    if(parts[0] === 'www') {
      if(parts.length === 3) {
        return '@' + Array(39).join(" ");
      } else {
        parts.pop();
        parts.pop();
        parts.shift();

        var domain = parts.join('.');

        return domain + Array(39 - domain.length+1).join(" ");
      }
    }

    return false;
  }.property('domain'),


  actions: {
    updateDns: function() {
      var domain = this.get('domain');
      var siteName = this.get('session.site.name');

      if(domain.indexOf('http://') === 0) {
        domain = domain.replace('http://');
      }
      
      this.get('errors').clear();

      if(this.get('domain').replace(' ', '') === '') {
        this.get('errors').pushObject('Domain name can not be empty.');
        return;
      }

      if(this.get('domain').indexOf('*') !== -1) {
        this.get('errors').pushObject('Domain name can not contain wildcard (*).');
        return;
      }

      this.set('isSending', true);

      function uniqueId() {
        return Date.now() + 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
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
