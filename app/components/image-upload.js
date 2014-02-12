export default Ember.Component.extend({

  // map action to formbuilder-widget action...
  notify: 'notify',

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

    var $uploadInput = this.$('input[type=hidden]').upload({
      uploadTrigger : this.$('.wy-form-upload button'),
      uploadDropzone: this.$('.wy-form-upload button'),
      uploadUrl     : window.ENV.uploadUrl,
      uploadSite    : session.get('site.name'),
      uploadToken   : session.get('site.token')
    }).on({
      'dragenter.wh.upload': function () {
        $(this).data('upload').$triggerElement
          .removeClass('icon-image icon-desktop btn-neutral')
          .addClass('icon-arrow-down btn-success')
          .text(' Drop files here');
      },
      'dragleave.wh.upload': resetButton,
      'dragdrop.wh.upload': resetButton,
      'error.wh.upload': function (event, response) {
        self.sendAction('notify', 'danger', 'Mike, make this error more useful. kthx.');
      },
      'start.wh.upload': function () {
        $container.show();
        $url.hide();
        $(this).data('upload').$triggerElement.hide();
        $loading.css('display', 'inline-block');
        $loading.find('span').html('Uploading <span>0%</span>');
      },
      'thumb.wh.upload': function (event, thumb) {
        self.set('initial', null);
        $upload.find('.wy-form-upload-image.edit').remove();
        $('<div class="wy-form-upload-image edit">')
          .prependTo($upload)
          .append(thumb);
      },
      'progress.wh.upload': function (event, percentage) {
        if (percentage < 100) {
          $loading.find('span').html('Uploading <span>' + percentage + '%</span>');
        } else {
          $loading.find('span').text('Finishing up...');
        }
      },
      'load.wh.upload': function (event, response) {
        control.set('value', response.url);
        self.sendAction('notify', 'success', 'File upload complete.');
        $(this).data('upload').$element.val(response.url);
      },
      'done.wh.upload': function () {
        $loading.hide();
        $(this).data('upload').$triggerElement.show();
      }
    });

    this.$('.wy-form-upload-url .upload-url').on('click', function () {
      $uploadInput.upload('upload', this.$('.wy-form-upload-url input').val());
      this.$('.wy-form-upload-url input').val('');
    }.bind(this));

    this.$('.upload-method-toggle').on('click', function () {
      this.$('.wy-form-upload-container, .wy-form-upload-url').toggle();
    }.bind(this));
  },
});
