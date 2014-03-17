export default Ember.Component.extend({

  // map action to formbuilder-widget action...
  notify: 'notify',
  onDoneUpload: '',

  control: Ember.Object.create(),

  successMsg    : ' File upload complete.',
  defaultClasses: 'icon-paper-clip',

  wantUploadButton: true,

  showUploadButton: function () {
    return Ember.isNone(this.get('control.value')) && this.get('wantUploadButton');
  }.property('control.value', 'wantUploadButton'),

  wantUrlInput: false,

  showUrlInput: function () {
    return Ember.isNone(this.get('control.value')) && this.get('wantUrlInput');
  }.property('control.value', 'wantUrlInput'),

  didInsertElement: function () {

    var self = this;

    this.$container = this.$('.wy-form-upload-container');
    this.$upload    = this.$('.wy-form-upload');
    this.$url       = this.$('.wy-form-upload-url');
    this.$loading   = this.$('.wy-form-upload .image-loading');
    this.$uploadBtn = this.$('.wy-form-upload-content button');

    this.set('defaultText', this.$uploadBtn.text());

    // create uploader with required params
    this.uploader = new Webhook.Uploader(window.ENV.uploadUrl, this.get('session.site.name'), this.get('session.site.token'));

    // when a file is selected, upload
    this.$uploadBtn.selectFile({
      accept  : this.get('selectAccept'),
      multiple: this.get('selectMultiple')
    }).on('selectedFile', function (event, file) {
      self.selectedFile.call(self, file);
    });

    this.$('.wy-form-upload-url .upload-url').on('click', function () {
      this.selectedFile(this.$('.wy-form-upload-url input').val());
      this.$('.wy-form-upload-url input').val('');
    }.bind(this));

    var resetButton = function () {
      this.$('.wy-form-upload-content button')
        .removeClass('icon-desktop icon-arrow-down btn-success')
        .addClass(this.get('defaultClasses'))
        .text(this.get('defaultText'));
    }.bind(this);

    // Dropzone behavior
    this.$uploadBtn.dropzone().on({
      dropzonewindowenter: function () {
        $(this)
          .removeClass('icon-image icon-desktop btn-neutral')
          .addClass('icon-arrow-down btn-success')
          .text(' Drop files here');
      },
      dropzonewindowdrop: resetButton,
      dropzonewindowleave: resetButton,
      drop: function (event) {
        Ember.$.each(event.originalEvent.dataTransfer.files, function (index, file) {
          $(this).trigger('selectedFile', file);
        }.bind(this));
        resetButton();
      }
    });

    // Just some additional styles
    this.$uploadBtn.on({
      mouseenter: function () {
        $(this)
          .removeClass(self.get('defaultClasses'))
          .addClass('icon-desktop btn-neutral')
          .text(' Select from desktop');
      },
      mouseleave: resetButton
    });

  },

  selectedFile: function (file) {

    var self = this,
        fileName = typeof file === 'string' ? file.split('/').pop() : file.name;

    self.beforeUpload.call(self, file);

    // upload returns promise
    var uploading = self.uploader.upload(file);

    uploading.progress(function (event) {
      self.progressUpload.call(self, file, Math.ceil((event.loaded * 100) / event.total));
    });

    uploading.done(function (response) {
      self.doneUpload.call(self, file, response.url);
    });

    uploading.always(function () {
      self.afterUpload.call(self, file);
    });

    uploading.fail(function (response) {
      this.sendAction(
        'notify',
        'danger',
        'Error: ' + response.statusText + '. ' +  fileName + ' failed to upload. ');
      self.failUpload.call(self, response);
    }.bind(this));

    return uploading;
  },

  willDestroyElement: function () {
    this.$uploadBtn.data('selectFile').$fileinput.remove();
  },

  beforeUpload: function (file) {
    this.set('control.value', null);
    this.set('wantUploadButton', true);
    this.set('wantUrlInput', false);
    this.$uploadBtn.hide();
    this.$loading.css('display', 'inline-block');

    if (typeof file === 'string') {
      this.$loading.find('span').text('fetching image...');
    }
  },

  progressUpload: function (file, percentage) {
    if (percentage < 100) {
      this.$loading.find('span').html('Uploading <span>' + percentage + '%</span>');
    } else {
      this.$loading.find('span').text('Finishing up...');
    }
  },

  doneUpload: function (file, url) {
    this.set('control.value', url);
    this.sendAction('notify', 'success', this.get('successMsg'));
    this.sendAction('onDoneUpload', url);
  },

  afterUpload: function () {
    this.$loading.hide().find('span').text('');
    this.$uploadBtn.show();
  },

  // override for custom implementation
  failUpload: function () {},

  actions: {
    clear: function () {
      this.set('control.value', null);
    },
    toggleMethod: function () {
      this.toggleProperty('wantUrlInput');
      this.toggleProperty('wantUploadButton');
    }
  }
});
