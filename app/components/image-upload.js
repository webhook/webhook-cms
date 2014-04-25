/* global Image */

import FileUploadComponent from 'appkit/components/file-upload';

export default FileUploadComponent.extend({
  selectAccept  : 'image/*',
  defaultClasses: 'icon-picture',
  successMsg    : ' Image upload complete.',
  tempUrl       : null,

  postParams: {
    resize_url: true
  },

  hasPreview: function () {
    return this.get('control.value.resize_url') || this.get('tempUrl');
  }.property('control.value.resize_url', 'tempUrl'),

  // Show preview of file
  beforeUpload: function (file) {
    this._super.apply(this, arguments);

    this.set('tempUrl', typeof file === 'string' ? file : (window.URL || window.webkitURL).createObjectURL(file));
  },

  // Add image meta data
  doneUpload: function (file, response) {
    this._super.apply(this, arguments);

    this.set('control.value.resize_url', response.resize_url);
    this.set('tempUrl', null);

    var imageComponent = this;

    // Load image to get dimensions
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
