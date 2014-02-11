export default Ember.Component.extend({

  // map action to formbuilder-widget action...
  notify: 'notify',

  didInsertElement: function () {

    var self = this,
        session = this.get('session'),
        control = this.get('control');

    this.set('initial', control.get('value'));

    var $container = this.$('.wy-form-upload-container'),
        $url = $('.wy-form-upload-url');

    var $uploadInput = this.$('input[type=hidden]').upload({
      uploadTrigger : this.$('.wy-form-upload'),
      uploadDropzone: this.$('.wy-form-upload'),
      uploadUrl     : window.ENV.uploadUrl,
      uploadSite    : session.get('site.name'),
      uploadToken   : session.get('site.token')
    }).on({
      'dragenter.wh.upload': function () {
        $(this).data('upload').$dropzone.addClass('wh-form-upload-drop');
      },
      'dragleave.wh.upload': function () {
        $(this).data('upload').$dropzone.removeClass('wh-form-upload-drop');
      },
      'dragdrop.wh.upload': function () {
        $(this).data('upload').$dropzone.removeClass('wh-form-upload-drop');
      },
      'error.wh.upload': function (event, response) {
        $(this).data('upload').$dropzone.removeClass('wy-form-uploading');
        self.sendAction('notify', 'danger', 'Mike, make this error more useful. kthx.');
      },
      'start.wh.upload': function () {
        $container.show();
        $url.hide();
        $(this).data('upload').$dropzone.addClass('wy-form-uploading');
        $(this).data('upload').$dropzone.find('.image-loading span').html('Uploading <span>0%</span>');
      },
      'thumb.wh.upload': function (event, thumb) {
        self.set('initial', null);
        $(this).data('upload').$dropzone.find('.wy-form-upload-image img.blob').remove();
        $(this).data('upload').$dropzone.find('.wy-form-upload-image').append($(thumb).addClass('blob'));
      },
      'progress.wh.upload': function (event, percentage) {
        if (percentage < 100) {
          $(this).data('upload').$dropzone.find('.image-loading span').html('Uploading <span>' + percentage + '%</span>');
        } else {
          $(this).data('upload').$dropzone.find('.image-loading span').text('Finishing up...');
        }
      },
      'load.wh.upload': function (event, response) {
        $(this).data('upload').$dropzone.removeClass('wy-form-uploading');
        control.set('value', response.url);
        self.sendAction('notify', 'success', 'Mother effin\' file uploaded!');
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
