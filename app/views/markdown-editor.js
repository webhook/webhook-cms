export default Ember.View.extend({
  classNames: ['wh-markdown-editor'],
  classNameBindings: ['whMarkdownEditorFullscreen'],

  wyMarkdownEditorFullscreen: false,

  didInsertElement: function () {
    this.$('.fullscreen-toggle').on('click', this.toggleFullscreen.bind(this));

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
  }

});
