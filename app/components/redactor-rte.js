export default Ember.Component.extend({
  didInsertElement: function () {
    this.$('textarea').webhookRedactor();
  }
});
