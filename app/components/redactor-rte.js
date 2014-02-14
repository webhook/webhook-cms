export default Ember.Component.extend({
  didInsertElement: function () {
    var self = this,
        session = this.get('session');

    var rte = this.$('textarea').webhookRedactor({
      initCallback: function() {
        if (self.get('value')) {
          this.set(self.get('value'));
        }
      },
      changeCallback: function(html) {
        self.set('value', html);
      }
    });

    var whRedactor = rte.webhookRedactor('getObject');

    whRedactor.buttonAddBefore('video', 'image', 'Image');

    $(whRedactor.buttonGet('image')).upload({
      uploadUrl  : window.ENV.uploadUrl,
      uploadSite : session.get('site.name'),
      uploadToken: session.get('site.token')
    }).on({
      'load': $.proxy(function (event, response) {

        window.console.log(response.url);

        // maintain undo buffer
        this.bufferSet();

        var data = '<figure data-type="image" class="wy-figure-large"><img src="' + response.url + '"><figcaption>Type to add caption (optional)</figcaption></figure>';

        this.selectionRestore();

        var current = this.getBlock() || this.getCurrent();

        if (current) {
          $(current).after(data);
        } else {
          this.insertHtmlAdvanced(data, false);
        }

        this.sync();
        this.modalClose();

        self.sendAction('notify', 'success', 'File upload complete.');
      }, whRedactor)
    });
  }
});
