export default Ember.Component.extend({

  showPreview: true,

  dataString: function () {
    return JSON.stringify(this.get('control.value'), null, 2);
  }.property('control.value'),

  previewStyle: function () {
    return this.get('showPreview') ? 'display: block' : 'display: none';
  }.property('showPreview'),

  didInsertElement: function () {
    this.previewValue();
  },

  previewValue: function () {
    if (Ember.isNone(this.get('control.value'))) {
      return;
    }

    switch (this.get('control.value.type')) {
    case 'video':
    case 'rich':
      this.$('.preview').html(this.get('control.value.html'));
      break;
    case 'photo':
      $('<img>').attr('src', this.get('control.value.thumbnail_url')).appendTo(this.$('.preview'));
      break;
    default:
      this.$('.preview').text(this.get('control.value.title') + ' (' + this.get('control.value.original_url') + ')');
      break;
    }

  },

  actions: {
    getEmbed: function () {
      if (!this.get('url') || this.get('isFetching')) {
        return;
      }

      this.set('isFetching', true);
      this.$('.preview').empty();
      this.set('control.value', {});
      $.embedly.oembed(this.get('url'), {
        key: window.ENV.embedlyKey,
        query: this.get('control.meta.data.options')
      }).progress(function (data) {
        this.set('isFetching', false);
        this.set('control.value', data);
        this.previewValue();
      }.bind(this));
    },

    togglePreview: function () {
      this.toggleProperty('showCode');
      this.toggleProperty('showPreview');
    }
  }
});
