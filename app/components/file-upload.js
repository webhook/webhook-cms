export default Ember.Component.extend({

  // map action to formbuilder-widget action...
  notify: 'notify',
  onDoneUpload: '',

  control: Ember.Object.create(),

  successMsg    : ' File upload complete.',
  defaultClasses: 'icon-paper-clip',

  wantUploadButton: true,

  postParams: {},

  showUploadButton: function () {
    return Ember.isNone(this.get('control.value.url')) && this.get('wantUploadButton');
  }.property('control.value.url', 'wantUploadButton'),

  wantUrlInput: false,

  showUrlInput: function () {
    return Ember.isNone(this.get('control.value.url')) && this.get('wantUrlInput');
  }.property('control.value.url', 'wantUrlInput'),

  didInsertElement: function () {

    var self = this;

    this.$container = this.$('.wy-form-upload-container');
    this.$upload    = this.$('.wy-form-upload');
    this.$url       = this.$('.wy-form-upload-url');
    this.$loading   = this.$('.wy-form-upload .image-loading');
    this.$uploadBtn = this.$('.wy-form-upload-content button');

    this.set('defaultText', this.$uploadBtn.text());

    // create uploader with required params
    var url   = window.ENV.uploadUrl,
        site  = this.get('session.site.name'),
        token = this.get('session.site.token');

    this.uploader = new Webhook.Uploader(url, site, token, { data: this.get('postParams') });

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

    Ember.Logger.info(fileName, 'selected', (file.size / 1048576), 'MB');

    if (file.size / 1048576 > 50) {
      this.sendAction('notify', 'danger', 'Error: File is too large (>50MB).');
      return;
    }

    self.beforeUpload.call(self, file);

    // upload returns promise
    var uploading = self.uploader.upload(file);

    uploading.progress(function (event) {
      self.progressUpload.call(self, file, Math.ceil((event.loaded * 100) / event.total));
    });

    uploading.done(function (response) {
      self.doneUpload.call(self, file, response);
    });

    uploading.always(function () {
      self.afterUpload.call(self, file);
    });

    uploading.fail(function (response) {
      self.sendAction(
        'notify',
        'danger',
        'Error: ' + response.statusText + '. ' +  fileName + ' failed to upload.');
      self.failUpload.call(self, response);
    });

    return uploading;
  },

  willDestroyElement: function () {
    if (this.$uploadBtn && this.$uploadBtn.length) {
      this.$uploadBtn.data('selectFile').$fileinput.remove();
    }
  },

  clearValue: function () {
    var value = this.get('control.value');
    if (typeof value === 'object') {
      Ember.keys(value).forEach(function (property) {
        value.set(property, null);
      });
    } else {
      this.set('control.value', Ember.Object.create({}));
    }
  },

  beforeUpload: function (file) {
    this.clearValue();
    this.set('wantUploadButton', true);
    this.set('wantUrlInput', false);
    this.$uploadBtn.hide();
    this.$loading.css('display', 'inline-block');

    if (typeof file === 'string') {
      this.$loading.find('span').text('fetching file...');
    }
  },

  progressUpload: function (file, percentage) {
    if (percentage < 100) {
      this.$loading.find('span').html('Uploading <span>' + percentage + '%</span>');
    } else {
      this.$loading.find('span').text('Finishing up...');
    }
  },

  doneUpload: function (file, response) {

    var value = Ember.Object.create({ url: response.url });

    if (file && file.type) {
      value.set('type', file.type);
    }

    if (file && file.size) {
      value.set('size', file.size);
    }

    this.set('control.value', value);
    this.sendAction('notify', 'success', this.get('successMsg'));
    this.sendAction('onDoneUpload', response);
  },

  afterUpload: function () {
    this.$loading.hide().find('span').text('');
    this.$uploadBtn.show();
  },

  // override for custom implementation
  failUpload: function () {},

  actions: {
    clear: function () {
      this.clearValue();
    },
    toggleMethod: function () {
      this.toggleProperty('wantUrlInput');
      this.toggleProperty('wantUploadButton');
    }
  }
});
