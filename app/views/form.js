export default Ember.View.extend({
  affixNav: function () {
    // we have to wait until the template updates.
    Ember.run.later(function () {
      this.$('[data-spy=affix]').affix();
    }.bind(this), 10);
  },
  didInsertElement: function () {
    this.get('controller').addObserver('isEditing', this, this.affixNav);
    this.affixNav();
  },
  willDestroyElement: function () {
    this.get('controller').removeObserver('isEditing', this, this.affixNav);
  }
});
