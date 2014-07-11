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
          var fragment = Ember.$('<div>').html(redactor.get());

          // remove empty captions
          fragment.find('figcaption').filter(function() {
            return $.trim($(this).text()) === '';
          }).remove();

          self.set('value', fragment.html());

          // data isn't being set in time for the save so force it.
          Ember.run.sync();
        });

        // override redactor z-index
        redactor.$box.css('z-index', '');
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

    // figure out where the cursor is
    this.set('cursorElement', this.get('whRedactor').getBlock() || this.get('whRedactor').getCurrent());

    // fake a control
    this.set('fakeImageControl', Ember.Object.create());

    // show image upload widget
    this.set('showImageModal', true);

  },

  resizeImage: function (url, width) {

    return url + '=s' + width;

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
        var url = $(this).find('img').attr('data-resize-src'),
            resizeUrl = self.resizeImage(url, size);
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
    handleUpload: function (response) {

      if (!(response && response.url)) {
        return;
      }

      this.set('showImageModal', false);

      var whRedactor = this.get('whRedactor');

      var data = '<figure data-type="image"><a href="' + response.url + '"><img data-resize-src="' + response.resize_url + '" src="' + this.resizeImage(response.resize_url, 1200) + '"></a><figcaption></figcaption></figure>';

      whRedactor.selectionRestore();

      if (this.get('cursorElement')) {
        $(this.get('cursorElement')).after(data);
      } else {
        whRedactor.insertHtmlAdvanced(data, false);
      }

      whRedactor.selectionRestore();

      whRedactor.sync();

    }
  }
});
