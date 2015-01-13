/*global CodeMirror*/
export default Ember.Component.extend({
  classNames: ['wh-markdown-editor'],
  classNameBindings: ['whMarkdownEditorFullscreen'],

  whMarkdownEditorFullscreen: false,

  editorObj: null,

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
    this.$('.theme-toggle').on('click', this.toggleTheme.bind(this));

    this.get('editorObj').on('change', this.syncPreview.bind(this));
    this.get('editorObj').on('change', function() {
      this.set('value', this.get('editorObj').getValue());
    }.bind(this));
//    this.$('textarea').on('keyup', this.updateSelectionStart.bind(this));
 //   this.$('textarea').on('mouseup', this.updateSelectionStart.bind(this));
  },

  updateSelectionStart: function () {
  //  this.set('selectionStart', this.$('textarea').get(0).selectionStart);
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
      this.get('editorObj').refresh();
    }.bind(this), 1000);
  },

  toggleTheme: function () {
    this.$('.CodeMirror').toggleClass('theme-dark');
    this.$('.theme-toggle').toggleClass('active');
  },

  syncPreview: function () {
    this.$('.wh-markdown-preview').html(marked(this.get('editorObj').getValue()));
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

//      this.$('textarea').val([value.slice(0, position), image, value.slice(position)].join(''));

    }
  }
});
