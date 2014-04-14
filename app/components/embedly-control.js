export default Ember.Component.extend({

  showPreview: true,
  showCode   : false,

  hasValue: function () {
    return this.get('control.value.url');
  }.property('control.value'),

  dataString: function () {
    return JSON.stringify(this.get('control.value'), null, 2);
  }.property('control.value'),

  previewValue: function () {

    var preview = '';

    switch (this.get('control.value.type')) {
    case 'video':
    case 'rich':
      preview = this.get('control.value.html');
      break;
    case 'photo':
      preview = '<img src="' + this.get('control.value.thumbnail_url') + '">';
      break;
    default:
      if (this.get('control.value.title')) {
        preview = this.get('control.value.title') + ' (' + this.get('control.value.original_url') + ')';
      }
      break;
    }

    return preview;

  }.property('control.value'),

  actions: {
    getEmbed: function () {
      if (!this.get('url') || this.get('isFetching')) {
        return;
      }

      this.set('isFetching', true);
      this.set('control.value', {});
      $.embedly.oembed(this.get('url'), {
        key: window.ENV.embedlyKey,
        query: this.get('control.meta.data.options')
      }).progress(function (data) {
        this.set('isFetching', false);
        this.set('control.value', data);
      }.bind(this));
    },

    togglePreview: function () {
      this.toggleProperty('showCode');
      this.toggleProperty('showPreview');
    },

    clearValue: function () {
      this.set('control.value', {});
    }
  }
});
