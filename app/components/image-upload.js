export default Ember.Component.extend({

  // map action to formbuilder-widget action...
  notify: 'notify',

  control: Ember.Object.create(),

  didInsertElement: function () {

    var self = this,
        session = this.get('session'),
        control = this.get('control');

    this.set('initial', control.get('value'));

    var resetButton = function () {
      this.$('.wy-form-upload-content button')
        .removeClass('icon-desktop icon-arrow-down btn-success')
        .addClass('icon-image btn-neutral')
        .text(' Drag or select image');
    }.bind(this);

    var $container = this.$('.wy-form-upload-container'),
        $upload = this.$('.wy-form-upload'),
        $url = this.$('.wy-form-upload-url'),
        $loading = this.$('.wy-form-upload .image-loading');

    var $uploadButton = this.$('.wy-form-upload-content button').upload({
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
        control.set('value', response.url);
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

    this.$('.wy-form-upload-url .upload-url').on('click', function () {
      $uploadButton.upload('upload', this.$('.wy-form-upload-url input').val());
      this.$('.wy-form-upload-url input').val('');
    }.bind(this));

    this.$('.upload-method-toggle').on('click', function () {
      this.$('.wy-form-upload-container, .wy-form-upload-url').toggle();
    }.bind(this));
  },

  actions: {
    clear: function () {
      this.set('control.value', null);
      this.$('.wy-form-upload .wy-form-upload-image').remove();
    }
  }
});
