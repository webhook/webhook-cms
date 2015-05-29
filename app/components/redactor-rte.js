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

        if (self.get('disabled')) {
          redactor.opts.buttons.forEach(function (button) {
            redactor.button.remove(button);
          });
          redactor.opts.plugins.forEach(function (button) {
            if (button === 'fullscreen') {
              return;
            }
            redactor.button.remove(button);
          });
          redactor.$editor.removeAttr('contenteditable');
          return;
        }

        if (self.get('value')) {
          // explicitly check for false (null means yes)
          if (self.get('options.javascript') === false) {
            redactor.insert.html(self.get('value'));
          } else {
            // redactor.insert.html(self.get('value'), false); should work but it doesn't
            // perhaps redactor version too old
            redactor.code.set(self.get('value'));
          }
        }

        rte.on('mutate.webhookRedactor', function (event, redactor) {
          var fragment = Ember.$('<div>').html(redactor.code.get());

          // remove empty captions
          fragment.find('figcaption').filter(function() {
            return $.trim($(this).text()) === '';
          }).remove();

          fragment.find('cite').filter(function() {
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

    var redactorOptions = {};

    if (this.get('options.javascript') === false) {
      redactorOptions.deniedTags = ['script'];
      redactorOptions.allowedAttr =  [
        ['a', ['href']],
        ['p', 'class'],
        ['img', ['src', 'alt']],
        ['figure', ['data-type', 'class']]
      ];
    }

    rte.webhookRedactor(redactorOptions);

    var whRedactor = rte.webhookRedactor('core.getObject');
    this.set('whRedactor', whRedactor);

    if (this.get('disabled')) {
      return;
    }

    var button = whRedactor.button.addBefore('video', 'image', 'Image');
    whRedactor.button.addCallback(button, this.imageButtonCallback.bind(this));

    whRedactor.button.get('image').addClass('redactor_btn_image');

    // turn off buttons that are disabled
    Ember.$.each(this.get('options') || {}, function (option, value) {
      if (!value) {
        Ember.$(whRedactor.button.get(option)).toggle();
      }
    });

    // Observe changes to options (form builder)
    this.observeOptions();

    // Watch images for size changes
    this.observeImages();

  },

  imageButtonCallback: function () {

    // maintain undo buffer
    this.get('whRedactor').buffer.set();

    // figure out where the cursor is
    this.set('cursorElement', this.get('whRedactor').selection.getBlock() || this.get('whRedactor').selection.getCurrent());

    // fake a control
    if (!this.get('fakeImageControl')) {
      this.set('fakeImageControl', Ember.Object.create({ value: Ember.Object.create() }));
    } else {
      var value = this.get('fakeImageControl.value');
      Ember.keys(value).forEach(function (property) {
        value.set(property, null);
      });
    }

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
    Ember.$(this.get('whRedactor').button.get(option.split('.').pop())).toggle();
  },

  actions: {
    handleUpload: function (response) {

      if (!(response && response.url)) {
        return;
      }

      this.set('showImageModal', false);

      var whRedactor = this.get('whRedactor');

      var data = '<figure data-type="image"><a href="' + response.url + '"><img data-resize-src="' + response.resize_url + '" src="' + this.resizeImage(response.resize_url, 1200) + '"></a><figcaption></figcaption></figure>';

      whRedactor.selection.restore();

      if (this.get('cursorElement')) {
        $(this.get('cursorElement')).after(data);
      } else {
        whRedactor.insertHtmlAdvanced(data, false);
      }

      whRedactor.selection.restore();

      whRedactor.code.sync();

    }
  }
});
