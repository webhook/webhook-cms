export default Ember.Component.extend({
  didInsertElement: function () {
    var self = this,
        session = this.get('session'),
        control = this.get('control');

    this.set('initial', control.get('value'));

    this.$('input').upload({
      uploadTrigger: this.$('.wy-form-upload'),
      uploadDropzone: this.$('.wy-form-upload')
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
        $(this).data('upload').$dropzone.find('.image-error').show().text(response);
      },
      'start.wh.upload': function () {
        $(this).data('upload').options.uploadUrl   = window.ENV.uploadUrl;
        $(this).data('upload').options.uploadSite  = session.get('site.name');
        $(this).data('upload').options.uploadToken = session.get('site.token');
        $(this).data('upload').$dropzone.addClass('wy-form-uploading');
        $(this).data('upload').$dropzone.find('.image-error').hide();
        $(this).data('upload').$dropzone.find('.image-loading p').html('Uploading <span>0%</span>');
      },
      'thumb.wh.upload': function (event, thumb) {
        self.set('initial', null);
        $(this).data('upload').$dropzone.find('.wy-form-upload-image img.blob').remove();
        $(this).data('upload').$dropzone.find('.wy-form-upload-image').append($(thumb).addClass('blob'));
      },
      'progress.wh.upload': function (event, percentage) {
        if (percentage < 100) {
          $(this).data('upload').$dropzone.find('.image-loading span').text(percentage + '%');
        } else {
          $(this).data('upload').$dropzone.find('.image-loading p').text('Finishing up...');
        }
      },
      'load.wh.upload': function (event, response) {
        $(this).data('upload').$dropzone.removeClass('wy-form-uploading');
        control.set('value', response.url);
      }
    });
  }
});
