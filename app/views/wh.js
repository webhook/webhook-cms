export default Ember.View.extend({
  didInsertElement: function () {
    this.$('[data-spy=affix]').affix();
  }
});
