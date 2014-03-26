export default Ember.Component.extend({
  classNames: ['wh-markdown-editor'],
  classNameBindings: ['whMarkdownEditorFullscreen'],

  wyMarkdownEditorFullscreen: false,

  selectionStart: 0,

  didInsertElement: function () {
    this.$('.fullscreen-toggle').on('click', this.toggleFullscreen.bind(this));

    this.$('textarea').on('keyup', this.updateSelectionStart.bind(this));
    this.$('textarea').on('mouseup', this.updateSelectionStart.bind(this));
  },

  updateSelectionStart: function () {
    this.set('selectionStart', this.$('textarea').get(0).selectionStart);
  },

  toggleFullscreen: function () {
    this.toggleProperty('whMarkdownEditorFullscreen');
    this.$('.fullscreen-toggle').toggleClass('icon-fullscreen icon-resize-small');

    if (this.get('whMarkdownEditorFullscreen')) {
      this.syncPreview();
      this.$('textarea').on('keyup', this.syncPreview.bind(this));
    } else {
      this.$('textarea').off('keyup', this.syncPreview.bind(this));
    }
  },

  syncPreview: function () {
    this.$('.wh-markdown-preview').html(marked(this.$('textarea').val()));
  },

  actions: {
    toggleImageModal: function () {

      // fake a control
      this.set('fakeImageControl', Ember.Object.create());

      // show image upload widget
      this.set('showImageModal', true);

    },
    handleUpload: function (url) {

      if (!url) {
        return;
      }

      // hide image upload widget
      this.set('showImageModal', false);

      if (url.indexOf('http://') === -1) {
        url = 'http://' + window.ENV.siteDNS + url;
      }

      var value = this.$('textarea').val();
      var image = '![](' + url + ')';
      var position = this.get('selectionStart');

      this.$('textarea').val([value.slice(0, position), image, value.slice(position)].join(''));

    }
  }
});
