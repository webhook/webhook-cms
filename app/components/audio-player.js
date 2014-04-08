export default Ember.Component.extend({
  tagName: 'audio',
  didInsertElement: function () {

    var audioComponent = this;

    this.$().prop('controls', true);
    this.$().on('loadedmetadata', function () {
      audioComponent.sendAction('load', this);
    });
  }
});
