import uuid from 'appkit/utils/uuid';

export default Ember.Component.extend({
  willInsertElement: function () {
    var id = uuid();
    this.set('imageModelId', 'imageModel' + id);
    this.set('imageModelSectionId', 'imageModelSection' + id);
  },
  didInsertElement: function () {
    var self = this,
        session = this.get('session');

    var rteButtons = $.webhookRedactor.options.buttons.slice(),
        rtePlugins = $.webhookRedactor.options.plugins.slice();

    var rteOptions = this.get('options') || {};

    ['link'].forEach(function (button) {
      if (!rteOptions[button]) {
        rteButtons.splice(rteButtons.indexOf(button), 1);
      }
    });

    ['table', 'video', 'image', 'quote'].forEach(function (plugin) {
      if (!rteOptions[plugin]) {
        rtePlugins.splice(rtePlugins.indexOf(plugin), 1);
      }
    });

    var rte = this.$('textarea').webhookRedactor({
      buttons: rteButtons,
      plugins: rtePlugins,
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

    if (rteOptions['image']) {
      whRedactor.buttonAddBefore('video', 'image', 'Image', function () {

        // maintain undo buffer
        whRedactor.bufferSet();

        // or call a modal with a code
        this.modalInit('Insert Image', '#' + self.get('imageModelId'), 500, function () {

          var widget = Ember.$('#' + self.get('imageModelSectionId')).on('load', function (event, url) {

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

          self.initWidget.call(self, widget);

        });
      });
    }
  },

  initWidget: function (widget) {

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

  }
});
