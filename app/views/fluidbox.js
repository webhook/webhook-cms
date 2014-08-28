export default Ember.View.extend({
  tagName: 'a',
  attributeBindings: ['href'],
  href: function () {
    return this.get('image.resize_url') + '=s' + Math.max($(window).height(), $(window).width());
  }.property(),
  didInsertElement: function () {
    this.$().fluidbox();
  }
});
