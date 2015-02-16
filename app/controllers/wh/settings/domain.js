export default Ember.ObjectController.extend({
  domain : "",

  isSending: false,
  success  : false,
  error    :  '',
  errors   : Ember.A([]),
  failed   : false,
  verifying: false,

  init: function() {
    var siteName = this.get('session.site.name');

    window.ENV.firebaseRoot.child("management/sites/" + siteName + "/dns-status/status").on('value', function(snap) {
      var val = snap.val();

      if(val) {
        if(val.type === 'success') {
          this.set('success', true);
          this.set('verifying', false);
          this.set('failed', false);
        } else if (val.type === 'error') {
          this.set('success', false);
          this.set('verifying', false);
          this.set('failed', true);
        } else if (val.type === 'verifying') {
          this.set('success', false);
          this.set('verifying', true);
          this.set('failed', false);
        }
      } else {
        this.set('success', false);
        this.set('verifying', false);
        this.set('failed', false);
      }
    }.bind(this), function() { });
  },

  subdomain: function() {
    var parts = this.get('domain').split('.');

    if(parts.length < 3) {
      return '';
    }

    parts.pop();
    parts.pop();

    var domain = parts.join('.');

    if(domain.length < 39){
      domain = domain + new Array(39 - domain.length+1).join(" ");
    }

    return domain;
  }.property('domain'),

  secretSubdomain: function() {
    var sub = this.get('subdomain').replace(/ /g, '');

    sub = '_wh.' + sub;

    if(sub.length < 39) {
      sub = sub  + new Array(39 - sub.length+1).join(" ");
    }

    return sub;
  }.property('subdomain'),

  showRedirector: function() {
    var parts = this.get('domain').split('.');

    if(parts.length < 3) {
      return false;
    }

    if(parts[0] === 'www') {
      if(parts.length === 3) {
        return '@' + new Array(39).join(" ");
      } else {
        parts.pop();
        parts.pop();
        parts.shift();

        var domain = parts.join('.');

        if(domain.length < 39) {
          domain = domain + new Array(39 - domain.length+1).join(" ");
        }

        return domain;
      }
    }

    return false;
  }.property('domain'),

  prefixedDomain: function() {
    return 'http://' + this.get('domain');
  }.property('domain'),

  actions: {
    updateDns: function() {
      var domain = this.get('domain');
      var siteName = this.get('session.site.name');

      if(domain.indexOf('http://') === 0) {
        domain = domain.replace('http://');
      }
      
      this.set('error', '');

      if(this.get('domain').replace(' ', '') === '') {
        this.set('error', 'Domain name can not be empty.');
        return;
      }

      if(this.get('domain').indexOf('*') !== -1) {
        this.set('error', 'Domain name can not contain wildcard (*).');
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
        var id = uniqueId();
        var commandData = {
          dnsname: domain,
          id: id
        };


        // Set the ID here in the dns-status
        // Also set dns-status/status to in progress

        window.ENV.firebaseRoot.child("management/sites/" + siteName + "/dns-status/id").set(id, function() {
          window.ENV.firebaseRoot.child("management/sites/" + siteName + "/dns-status/status").set({ type: 'verifying' }, function() {
            window.ENV.firebaseRoot.child("management/commands/dns/" + siteName).set(commandData, function() {
             // this.set('success', true);
              this.set('isSending', false);
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }
});
