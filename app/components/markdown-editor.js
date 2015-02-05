/*global CodeMirror*/
export default Ember.Component.extend({
  classNames: ['wh-markdown-editor'],
  classNameBindings: ['whMarkdownEditorFullscreen'],

  whMarkdownEditorFullscreen: false,

  editorObj: null,

  selectionStart: 0,

  vimKeyMap: false,

  didInsertElement: function () {
    var keymap = 'default';

    if(window.localStorage.getItem('webhook-markdown-keymap') === 'true') {
      keymap = 'vim';
      this.$('.vim-toggle').toggleClass('active');
      this.set('vimKeyMap', true);
    }

    var editor = CodeMirror.fromTextArea(this.$('textarea')[0], {
      mode: 'gfm',
      lineNumbers: false,
      matchBrackets: true,
      lineWrapping: true,
      autoCloseBrackets: true,
      matchTags: true,
   //   showTrailingSpace: true,
     // autoCloseTags: true,
      theme: 'default',
      keyMap: keymap
    });

    if(window.localStorage.getItem('webhook-markdown-theme') === 'true') {
      this.$('.CodeMirror').toggleClass('theme-dark');
      this.$('.theme-toggle').toggleClass('active');
    }

    this.set('editorObj', editor);

    this.$('.fullscreen-toggle').on('click', this.toggleFullscreen.bind(this));
    this.$('.theme-toggle').on('click', this.toggleTheme.bind(this));
    this.$('.vim-toggle').on('click', this.toggleVIM.bind(this));

    this.get('editorObj').on('change', this.syncPreview.bind(this));
    this.get('editorObj').on('change', function() {
      this.set('value', this.get('editorObj').getValue());
    }.bind(this));

    this.$('.CodeMirror-scroll').scroll(function() {
      if(this.get('whMarkdownEditorFullscreen')) {
        var curTop = this.$('.CodeMirror-scroll').scrollTop();
        var effectiveHeight = this.$('.CodeMirror-scroll')[0].scrollHeight;
        var ratio = curTop / effectiveHeight;

        this.$('.wh-markdown-preview').scrollTop(this.$('.wh-markdown-preview')[0].scrollHeight * ratio);
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
      this.$('.CodeMirror-scroll').scroll();
      this.get('editorObj').refresh();
    }.bind(this), 1000);
  },

  toggleTheme: function () {
    this.$('.CodeMirror').toggleClass('theme-dark');
    this.$('.theme-toggle').toggleClass('active');
    window.localStorage.setItem('webhook-markdown-theme', this.$('.theme-toggle').hasClass('active'));
  },

  toggleVIM: function () {
    if(this.get('vimKeyMap')) {
      this.get('editorObj').setOption('keyMap', 'default');
      this.set('vimKeyMap', false);
      window.localStorage.setItem('webhook-markdown-keymap', false);
    } else {
      this.get('editorObj').setOption('keyMap', 'vim');
      this.set('vimKeyMap', true);
      window.localStorage.setItem('webhook-markdown-keymap', true);
    }
    this.$('.vim-toggle').toggleClass('active');
  },

  syncPreview: function () {
    var text = this.get('editorObj').getValue() || '';
    var caretPosition = this.get('editorObj').indexFromPos(this.get('editorObj').getCursor());
    this.$('.wh-markdown-preview').html(marked(text));
  },

  actions: {
    toggleImageModal: function () {

      // fake a control
      if (!this.get('fakeImageControl')) {
        this.set('fakeImageControl', Ember.Object.create({ value: Ember.Object.create() }));
      } else {
        var value = this.get('fakeImageControl.value');
        Ember.keys(value).forEach(function (property) {
          value.set(property, null);
        });
      }

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

      /*if (url.indexOf('http://') === -1) {
        url = 'http://' + window.ENV.siteDNS + url;
      }*/

      var value = this.$('textarea').val();
      var image = '![](' + url + ')';
      var position = this.get('selectionStart');

      this.get('editorObj').replaceSelection(image);
    }
  }
});
