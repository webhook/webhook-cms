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
      }
    });

    rte.webhookRedactor();

    var whRedactor = rte.webhookRedactor('getObject');
    this.set('whRedactor', whRedactor);

    whRedactor.buttonAddBefore('video', 'image', 'Image', this.imageButtonCallback.bind(this));

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

    // every time we call the redactor modal, we have to add the event listeners
    // redactor destroys dom elements (listeners)
    this.get('whRedactor').modalInit('Insert Image', '#' + this.get('imageModelId'), 500, this.addImageModalListener.bind(this));

  },

  embedlyUrl: function (url, width) {

    var params = [];
    params.push('width=' + width);
    params.push('url=' + encodeURIComponent(url));
    params.push('key=' + window.ENV.embedlyKey);

    return window.ENV.displayUrl + 'resize/?' + params.join('&');

  },

  addImageModalListener: function () {

    var self = this,
        whRedactor = this.get('whRedactor');

    var widget = Ember.$('#' + this.get('imageModelSectionId')).on('load', function (event, url) {

      var data = '<figure data-type="image"><a href="' + url + '"><img src="' + self.embedlyUrl(url, 1200) + '"></a><figcaption></figcaption></figure>';

      whRedactor.selectionRestore();

      var current = whRedactor.getBlock() || whRedactor.getCurrent();

      if (current) {
        $(current).after(data);
      } else {
        whRedactor.insertHtmlAdvanced(data, false);
      }

      whRedactor.sync();
      whRedactor.modalClose();

    });

    this.initImageWidget.call(this, widget);

  },

  // This handles the behavior of the image widget
  initImageWidget: function (widget) {

    var self = this;

    this.$widget    = widget;
    this.$container = widget.find('.wy-form-upload-container');
    this.$upload    = widget.find('.wy-form-upload');
    this.$url       = widget.find('.wy-form-upload-url');
    this.$loading   = widget.find('.wy-form-upload .image-loading');
    this.$uploadBtn = widget.find('.wy-form-upload-content button');

    this.set('defaultText', this.$uploadBtn.text());

    // create uploader with required params
    this.uploader = new Webhook.Uploader(window.ENV.uploadUrl, this.get('session.site.name'), this.get('session.site.token'));

    // when a file is selected, upload
    this.$uploadBtn.selectFile({
      accept: 'image/*'
    }).on('selectedFile', function (event, file) {
      self.selectedFile.call(self, file);
    });

    this.$upload.find('.upload-url').on('click', function () {
      this.selectedFile(this.$url.find('input').val());
      this.$url.find('input').val('');
    }.bind(this));

    widget.find('.upload-method-toggle').on('click', function () {
      widget.find('.wy-form-upload-container, .wy-form-upload-url').toggle();
    }.bind(this));

    var resetButton = function () {
      this.$uploadBtn
        .removeClass('icon-desktop icon-arrow-down btn-success')
        .addClass('icon-picture')
        .text(this.get('defaultText'));
    }.bind(this);

    // Dropzone behavior
    this.$uploadBtn.dropzone().on({
      dropzonewindowenter: function () {
        $(this)
          .removeClass('icon-image icon-desktop btn-neutral')
          .addClass('icon-arrow-down btn-success')
          .text(' Drop files here');
      },
      dropzonewindowdrop: resetButton,
      dropzonewindowleave: resetButton,
      drop: function (event) {
        Ember.$.each(event.originalEvent.dataTransfer.files, function (index, file) {
          $(this).trigger('selectedFile', file);
        }.bind(this));
        resetButton();
      }
    });

    // Just some additional styles
    this.$uploadBtn.on({
      mouseenter: function () {
        $(this)
          .removeClass('icon-picture')
          .addClass('icon-desktop btn-neutral')
          .text(' Select from desktop');
      },
      mouseleave: resetButton
    });

    return widget;

  },

  selectedFile: function (file) {

    var self = this;

    self.beforeUpload.call(self, file);

    // upload returns promise
    var uploading = self.uploader.upload(file);

    uploading.progress(function (event) {
      self.progressUpload.call(self, file, Math.ceil((event.loaded * 100) / event.total));
    });

    uploading.done(function (response) {
      self.doneUpload.call(self, file, response.url);
    });

    uploading.always(function () {
      self.afterUpload.call(self, file);
    });

    return uploading;
  },

  beforeUpload: function (file) {
    this.$container.show();
    this.$url.hide();
    this.$uploadBtn.hide();
    this.$loading.css('display', 'inline-block');

    this.set('initial', null);

    this.$('.wy-form-upload-image').remove();

    var image = Ember.$('<div class="wy-form-upload-image">');

    Ember.$('<img>').attr({
      src: (window.URL || window.webkitURL).createObjectURL(file)
    }).appendTo(image);

    image.prependTo(this.$upload);
  },

  progressUpload: function (file, percentage) {
    if (percentage < 100) {
      this.$loading.find('span').html('Uploading <span>' + percentage + '%</span>');
    } else {
      this.$loading.find('span').text('Finishing up...');
    }
  },

  doneUpload: function (file, url) {
    this.$widget.trigger('load', url);
  },

  afterUpload: function () {
    this.$loading.hide();
    this.$uploadBtn.show();
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
  }
});
