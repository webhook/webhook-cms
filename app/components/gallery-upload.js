import FileUploadComponent from 'appkit/components/file-upload';

export default FileUploadComponent.extend({
  selectAccept  : 'image/*',
  selectMultiple: true,
  defaultClasses: 'icon-picture',
  successMsg    : ' Image upload complete.',

  items: function () {
    return Ember.A(this.get('control.value').map(function (image) {
      return Ember.Object.create({
        image: image
      });
    }));
  }.property('control.value'),

  willInsertElment: function () {
    this.set('control.value', Ember.A(this.get('control.value')));
  },

  doneUpload: function (file, url) {
    this.get('control.value').pushObject({ url: url });
    this.sendAction('notify', 'success', this.get('successMsg'));
  },

  actions: {
    removeImage: function (item) {
      this.get('control.value').removeObject(item.image);
      this.get('items').removeObject(item);
    },
    editImage: function (item) {
      this.get('items').setEach('editing', null);
      item.set('editing', true);
    },
    closeEdit: function (item) {
      item.set('editing', null);
    }
  }
});
