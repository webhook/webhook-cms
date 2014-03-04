import FileUploadComponent from 'appkit/components/file-upload';

export default FileUploadComponent.extend({
  selectAccept: 'image/*',
  selectMultiple: true,
  defaultClasses: 'icon-picture',
  successMsg    : ' Image upload complete.',

  willInsertElement: function () {
    // Make sure value is MutableArray
    this.set('control.value', Ember.A(this.get('control.value')));
  },

  didInsertElement: function () {
    this._super();
  },

  doneUpload: function (file, url) {
    this.get('control.value').pushObject({url: url});
    this.sendAction('notify', 'success', this.get('successMsg'));
  },

  actions: {
    removeImage: function (image) {
      if (image === this.get('editingImage')) {
        this.set('editingImage', null);
      }
      this.get('control.value').removeObject(image);
    },
    editImage: function (image) {
      image.set('editing', true);
    },
    closeEdit: function () {
      this.set('editingImage', null);
    }
  }
});
