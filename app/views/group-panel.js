export default Ember.View.extend({
  tagName: 'li',
  classNameBindings: ['group.isOpen:active'],

  opened: function () {
    if (this.get('group.isOpen')) {
      $('html, body').animate({
        scrollTop: this.$().offset().top
      }, 1000);
    }
  }.observes('group.isOpen')
});
