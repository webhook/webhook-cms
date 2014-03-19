import uuid from 'appkit/utils/uuid';

export default Ember.Component.extend({

  whRedactor: null,

  willInsertElement: function () {
    // make a random id for the model template
    var id = uuid();
    this.set('imageModelId', 'imageModel' + id);
    this.set('imageModelSectionId', 'imageModelSection' + id);
  },

  didInsertElement: function () {
    var self = this,
        session = this.get('session');

    var rte = this.$('textarea');

    rte.one({
      'init.webhookRedactor': function (event, redactor) {
        if (self.get('value')) {
          redactor.set(self.get('value'));
        }
        rte.on('mutate.webhookRedactor', function (event, redactor) {
          self.set('value', redactor.get());
          // data isn't being set in time for the save so force it.
          Ember.run.sync();
        });

        // override redactor z-index
        redactor.$box.css('z-index', 'auto');
      }
    });

    rte.webhookRedactor();

    var whRedactor = rte.webhookRedactor('getObject');
    this.set('whRedactor', whRedactor);

    whRedactor.buttonAddBefore('video', 'image', 'Image', this.imageButtonCallback.bind(this));
    whRedactor.buttonGet('image').addClass('redactor_btn_image');

    // turn off buttons that are disabled
    Ember.$.each(this.get('options') || {}, function (option, value) {
      if (!value) {
        Ember.$(whRedactor.buttonGet(option)).toggle();
      }
    });

    // Observe changes to options (form builder)
    this.observeOptions();

    // Watch images for size changes
    this.observeImages();

  },

  imageButtonCallback: function () {

    // maintain undo buffer
    this.get('whRedactor').bufferSet();

    // fake a control
    this.set('fakeImageControl', Ember.Object.create());

    // show image upload widget
    this.set('showImageModal', true);

  },

  embedlyUrl: function (url, width) {

    if(url.indexOf('http://') === -1) {
      url = 'http://' + window.ENV.siteDNS + url;
    }

    var params = [];
    params.push('width=' + width);
    params.push('url=' + encodeURIComponent(url));
    params.push('key=' + window.ENV.embedlyKey);

    return window.ENV.displayUrl + 'resize/?' + params.join('&');

  },

  observeImages: function () {
    var self = this;
    this.get('whRedactor').$editor.on('imageCommand', 'figure', function (event, command) {

      var size;

      switch (command) {
      case 'small':
        size = 300;
        break;
      case 'medium':
        size = 600;
        break;
      case 'large':
        size = 1200;
        break;
      }

      if (size) {
        var url = $(this).find('a').attr('href'),
            resizeUrl = self.embedlyUrl(url, size);
        $(this).find('img').attr('src', resizeUrl);
      }
    });
  },

  observeOptions: function () {
    this.addObserver('options.table', this.toggleOption);
    this.addObserver('options.video', this.toggleOption);
    this.addObserver('options.image', this.toggleOption);
    this.addObserver('options.quote', this.toggleOption);
    this.addObserver('options.link', this.toggleOption);
  },

  toggleOption: function (component, option) {
    Ember.$(this.get('whRedactor').buttonGet(option.split('.').pop())).toggle();
  },

  actions: {
    handleUpload: function (url) {

      if (!url) {
        return;
      }

      this.set('showImageModal', false);

      var whRedactor = this.get('whRedactor');

      var data = '<figure data-type="image"><a href="' + url + '"><img src="' + this.embedlyUrl(url, 1200) + '"></a><figcaption></figcaption></figure>';

      whRedactor.selectionRestore();

      var current = whRedactor.getBlock() || whRedactor.getCurrent();

      if (current) {
        $(current).after(data);
      } else {
        whRedactor.insertHtmlAdvanced(data, false);
      }

      whRedactor.sync();

    }
  }
});
