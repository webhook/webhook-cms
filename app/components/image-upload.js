/* global Image */

import FileUploadComponent from 'appkit/components/file-upload';

export default FileUploadComponent.extend({
  selectAccept  : 'image/*',
  defaultClasses: 'icon-picture',
  successMsg    : ' Image upload complete.',

  postParams: {
    resize_url: true
  },

  valueChanged: function () {
    if (Ember.isNone(this.get('control.value'))) {
      this.$('.wy-form-upload-image').remove();
    }
  }.observes('control.value'),

  willInsertElement: function () {
    this.set('initial', this.get('control.value'));
  },

  beforeUpload: function (file) {

    this._super.apply(this, arguments);

    this.set('initial', null);

    this.$('.wy-form-upload-image').remove();

    var image = Ember.$('<div class="wy-form-upload-image">');

    Ember.$('<img>').attr({
      src: typeof file === 'string' ? file : (window.URL || window.webkitURL).createObjectURL(file)
    }).appendTo(image);

    image.prependTo(this.$upload);

  },

  // Add image meta data
  doneUpload: function (file, response) {
    this._super.apply(this, arguments);

    var imageComponent = this;

    imageComponent.set('control.value.resize_url', response.resize_url);

    var image = new Image();

    image.onload = function() {
      imageComponent.set('control.value.width', this.width);
      imageComponent.set('control.value.height', this.height);
    };

    image.src = response.url;
  },

  failUpload: function () {
    this.$('.wy-form-upload-image').remove();
  }
});
