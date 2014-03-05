import FileUploadComponent from 'appkit/components/file-upload';

export default FileUploadComponent.extend({
  selectAccept  : 'image/*',
  selectMultiple: true,
  defaultClasses: 'icon-picture',
  successMsg    : ' Image upload complete.',

  // keep control value synced with items
  updateValue: function () {
    this.set('control.value', this.get('items').filterBy('image.url').getEach('image'));
  }.observes('items.@each.image'),

  willInsertElement: function () {

    // create initial set of items from control value
    this.set('items', Ember.A(this.get('control.value')).map(function (image) {
      return Ember.Object.create({
        image: image
      });
    }));

  },

  didInsertElement: function () {
    this._super.apply(this, arguments);
    Ember.$(window).on('click', this.closeEdit.bind(this));
  },

  willDestroyElement: function () {
    Ember.$(window).off('click', this.closeEdit.bind(this));
  },

  // Override default behavior.
  // Keep track of progress for each image.
  selectedFile: function (file) {

    var item = Ember.Object.create();

    var uploading = this.uploader.upload(file);

    uploading.progress(function (event) {
      item.set('progress', Math.ceil((event.loaded * 100) / event.total));
    });

    uploading.done(function (response) {
      item.set('progress', null);
      item.set('image', { url: response.url });
      this.sendAction('notify', 'success', this.get('successMsg'));
    }.bind(this));

    this.get('items').pushObject(item);

  },

  closeEdit: function () {
    this.get('items').setEach('editing', null);
  },

  actions: {
    removeImage: function (item) {
      this.get('control.value').removeObject(item.image);
      this.get('items').removeObject(item);
    },
    editImage: function (item) {
      this.closeEdit();
      item.set('editing', true);
    },
    closeEdit: function () {
      this.closeEdit();
    }
  }
});
