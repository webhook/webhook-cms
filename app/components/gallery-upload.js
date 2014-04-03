/* global Image */

import FileUploadComponent from 'appkit/components/file-upload';

export default FileUploadComponent.extend({
  selectAccept  : 'image/*',
  selectMultiple: true,
  defaultClasses: 'icon-picture',
  successMsg    : ' Image upload complete.',

  items: Ember.A([]),

  postParams: {
    resize_url: true
  },

  willInsertElement: function () {
    // create initial set of items from control value
    this.set('items', Ember.A(this.get('control.value')).map(function (image) {
      return Ember.Object.create({ image: image });
    }));

    // keep control value synced with items
    this.addObserver('items.@each.image', function () {
      this.set('control.value', this.get('items').filterBy('image.url').getEach('image'));
    }.bind(this));
  },

  didInsertElement: function () {
    this._super.apply(this, arguments);
    Ember.$(window).one('click', this.closeEdit.bind(this));

    this.$().on('click', '.wy-form-gallery-edit', function (event) {
      if (!Ember.$(event.target).is('button')) {
        event.stopPropagation();
      }
    });
  },

  willDestroyElement: function () {
    this._super.apply(this, arguments);
    Ember.$(window).off('click', this.closeEdit.bind(this));
  },

  // Override default behavior.
  // Keep track of progress for each image.
  selectedFile: function (file) {

    // have something to start
    var item = Ember.Object.create({
      progress: '...',
      name: typeof file === 'string' ? file.split('/').pop() : file.name
    });

    this.get('items').pushObject(item);

    var uploading = this.uploader.upload(file);

    uploading.progress(function (event) {
      item.set('progress', Math.ceil((event.loaded * 100) / event.total));
    });

    uploading.done(function (response) {
      item.set('progress', null);
      item.set('image', {
        url: response.url,
        type: file.type,
        size: file.size,
        resize_url: response.resize_url
      });

      var image = new Image();

      image.onload = function() {
        item.set('image.width', this.width);
        item.set('image.height', this.height);
      };

      image.src = response.url;

      this.sendAction('notify', 'success', this.get('successMsg'));
    }.bind(this));

    uploading.fail(function (response) {
      this.sendAction('notify', 'danger', 'Error: ' + response.statusText + '. ' + item.get('name') + ' failed to upload. ');
      this.get('items').removeObject(item);
      item.destroy();
    }.bind(this));

  },

  closeEdit: function () {
    if (this.get('items')) {
      this.get('items').setEach('editing', null);
    }
  },

  actions: {
    removeImage: function (item) {
      this.get('control.value').removeObject(item.image);
      this.get('items').removeObject(item);
    },
    editImage: function (item) {
      var wasEditing = item.get('editing');
      this.closeEdit();
      if (!wasEditing) {
        item.set('editing', true);
      }
    },
    closeEdit: function () {
      this.closeEdit();
    }
  }
});
