export default Ember.Component.extend({
  classNames: ['wh-markdown-editor'],
  classNameBindings: ['whMarkdownEditorFullscreen'],

  wyMarkdownEditorFullscreen: false,

  didInsertElement: function () {
    this.$('.fullscreen-toggle').on('click', this.toggleFullscreen.bind(this));
  },

  toggleFullscreen: function () {
    this.toggleProperty('whMarkdownEditorFullscreen');
    this.$('.fullscreen-toggle').toggleClass('icon-fullscreen icon-resize-small');
    Ember.$('body').toggleClass('body-no-scroll');

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

      this.$('textarea').val(this.$('textarea').val() + '\n ![](' + url + ')');

    }
  }
});
