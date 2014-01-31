export default Ember.Component.extend({
  didInsertElement: function () {
    var self = this;
    this.$('textarea').webhookRedactor({
      initCallback: function() {
        if (self.get('value')) {
          this.set(self.get('value'));
        }
      },
      changeCallback: function(html) {
        self.set('value', html);
      }
    });
  }
});
