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
    this.set('whRedactor', whRedactor);

    whRedactor.buttonAddBefore('video', 'image', 'Image', this.imageButtonCallback.bind(this));

    // turn off buttons that are disabled
    Ember.$.each(this.get('options'), function (option, value) {
      if (!value) {
        Ember.$(whRedactor.buttonGet(option)).toggle();
      }
    });

    // Observe changes to options (form builder)
    this.observeOptions();

  },

  imageButtonCallback: function () {

    // maintain undo buffer
    this.get('whRedactor').bufferSet();

    // every time we call the redactor modal, we have to add the event listeners
    // redactor destroys dom elements (listeners)
    this.get('whRedactor').modalInit('Insert Image', '#' + this.get('imageModelId'), 500, this.addImageModelListener.bind(this));

  },

  addImageModelListener: function () {

    var whRedactor = this.get('whRedactor');

    var widget = Ember.$('#' + this.get('imageModelSectionId')).on('load', function (event, url) {

      var data = '<figure data-type="image"><img src="' + url + '"><figcaption>Type to add caption (optional)</figcaption></figure>';

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

    var self = this,
        session = this.get('session');

    var resetButton = function () {
      widget.find('.wy-form-upload-content button')
        .removeClass('icon-desktop icon-arrow-down btn-success')
        .addClass('icon-image btn-neutral')
        .text(' Drag or select image');
    }.bind(this);

    var $container = widget.find('.wy-form-upload-container'),
        $upload    = widget.find('.wy-form-upload'),
        $url       = widget.find('.wy-form-upload-url'),
        $loading   = widget.find('.wy-form-upload .image-loading');

    $upload.find('.wy-form-upload-image.edit').remove();

    var $uploadButton = widget.find('.wy-form-upload-content button').upload({
      uploadUrl  : window.ENV.uploadUrl,
      uploadSite : session.get('site.name'),
      uploadToken: session.get('site.token')
    }).dropzone().on({
      dropzonewindowenter: function () {
        $(this)
          .removeClass('icon-image icon-desktop btn-neutral')
          .addClass('icon-arrow-down btn-success')
          .text(' Drop files here');
      },
      dropzonewindowdrop: resetButton,
      dropzonewindowleave: resetButton,
      drop: function (event) {
        $(this).upload('upload', event.originalEvent.dataTransfer.files[0]);
        resetButton.call(this);
      },
      'error': function (event, response) {
        self.sendAction('notify', 'danger', 'Mike, make this error more useful. kthx.');
      },
      'start': function () {
        $container.show();
        $url.hide();
        $uploadButton.hide();
        $loading.css('display', 'inline-block');
        $loading.find('span').html('Uploading <span>0%</span>');
      },
      'thumb': function (event, thumb) {
        self.set('initial', null);
        $upload.find('.wy-form-upload-image.edit').remove();
        $('<div class="wy-form-upload-image edit">')
          .prependTo($upload)
          .append(thumb);
      },
      'progress': function (event, percentage) {
        if (percentage < 100) {
          $loading.find('span').html('Uploading <span>' + percentage + '%</span>');
        } else {
          $loading.find('span').text('Finishing up...');
        }
      },
      'load': function (event, response) {
        widget.trigger('load', response.url);
        self.sendAction('notify', 'success', 'File upload complete.');
      },
      'done': function () {
        $loading.hide();
        $uploadButton.show();
      },
      mouseenter: function () {
        $(this)
          .removeClass('icon-image icon-arrow-down btn-success')
          .addClass('icon-desktop btn-neutral')
          .text(' Select from desktop');
      },
      mouseleave: resetButton
    });

    widget.find('.wy-form-upload-url .upload-url').on('click', function () {
      $uploadButton.upload('upload', widget.find('.wy-form-upload-url input').val());
      widget.find('.wy-form-upload-url input').val('');
    }.bind(this));

    widget.find('.upload-method-toggle').on('click', function () {
      widget.find('.wy-form-upload-container, .wy-form-upload-url').toggle();
    }.bind(this));

    return widget;

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
