/*global CodeMirror*/
export default Ember.Component.extend({
  classNames: ['wh-markdown-editor'],
  classNameBindings: ['whMarkdownEditorFullscreen'],

  whMarkdownEditorFullscreen: false,

  editorObj: null,
  scrollSync: null,

  selectionStart: 0,

  didInsertElement: function () {
    var editor = CodeMirror.fromTextArea(this.$('textarea')[0], {
      mode: 'gfm',
      lineNumbers: false,
      matchBrackets: true,
      lineWrapping: true,
      theme: 'default'
    });

    this.set('editorObj', editor);

    this.$('.fullscreen-toggle').on('click', this.toggleFullscreen.bind(this));

    this.get('editorObj').on('change', this.syncPreview.bind(this));
    this.get('editorObj').on('change', function() {
      this.set('value', this.get('editorObj').getValue());
    }.bind(this));

    this.set('scrollSync', window.scrollSync(this));


    this.$('.CodeMirror-scroll').scroll(function() {
      if(this.get('whMarkdownEditorFullscreen')) {
        this.get('scrollSync').sync();
      }
    }.bind(this));
  },

  toggleFullscreen: function () {
    this.toggleProperty('whMarkdownEditorFullscreen');
    this.$('.fullscreen-toggle').toggleClass('icon-fullscreen icon-resize-small');
    Ember.$('body').toggleClass('body-no-scroll');

    if (this.get('whMarkdownEditorFullscreen')) {
      this.syncPreview();
    }

    // Delay to wait for resize, will work in most cases
    setTimeout(function() {
      this.get('scrollSync').cache();
      this.get('editorObj').refresh();
    }.bind(this), 1000);
  },

  syncPreview: function () {
    var text = this.get('editorObj').getValue() || '';
    var caretPosition = this.get('editorObj').indexFromPos(this.get('editorObj').getCursor());

    text = text.slice(0, caretPosition) + '-~caret~-' + text.slice(caretPosition);
//    text = text.replace(/(\n|\r|\r\n)(\n|\r|\r\n)+/g, "$&-~marker~-$1$1");

    var previewText = marked(text.replace('-~caret~-', ''))
      .replace(/<p>-~marker~-<\/p>/g, '<span class="marker"></span>')
      .replace(/-~marker~-/g, '<span class="marker"></span>');

    var previewScrollerText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(\n|\r|\r\n)/g, '<br>')
      .replace('-~caret~-', '<span class="caret"></span>')
      .replace(/-~marker~-<br><br>/g, '<span class="marker"></span>');

    this.$('.wh-markdown-preview-scroller').html(previewScrollerText);
    this.$('.wh-markdown-preview').html(previewText);

    if(this.get('whMarkdownEditorFullscreen')) {
      this.get('scrollSync').cache();
    }
  },

  actions: {
    toggleImageModal: function () {

      // fake a control
      this.set('fakeImageControl', Ember.Object.create());

      // show image upload widget
      this.set('showImageModal', true);

    },
    handleUpload: function (response) {

      if (!response || !response.url) {
        return;
      }

      var url = response.url;

      // hide image upload widget
      this.set('showImageModal', false);

      if (url.indexOf('http://') === -1) {
        url = 'http://' + window.ENV.siteDNS + url;
      }

      var value = this.$('textarea').val();
      var image = '![](' + url + ')';
      var position = this.get('selectionStart');

      this.get('editorObj').replaceSelection(image);
    }
  }
});