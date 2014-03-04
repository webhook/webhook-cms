import FileUploadComponent from 'appkit/components/file-upload';

export default FileUploadComponent.extend({
  selectAccept: 'image/*',
  defaultClasses: 'icon-picture',
  successMsg    : ' Image upload complete.',

  valueChanged: function () {
    if (!this.get('control.value')) {
      this.$('.wy-form-upload-image').remove();
    }
  }.observes('control.value'),

  willInsertElement: function () {
    this.set('initial', this.get('control.value'));
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

  }
});
