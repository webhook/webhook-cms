export default Ember.CollectionView.extend({
  tagName: 'ul',
  classNames: ['wy-autocomplete-dropdown'],

  didInsertElement: function () {
    this.$().hide();
  },

  contentChanged: function () {

    if (this.get('content.length')) {
      this.get('content.firstObject').set('isSelected', true);
      this.$().show();
    } else {
      this.$().hide();
    }

  }.observes('content.@each'),

  itemViewClass: Ember.View.extend({
    classNameBindings: ['context.isSelected:on'],

    mouseEnter: function () {
      this.get('parentView.content').setEach('isSelected', false);
      this.set('context.isSelected', true);
    },

    click: function () {
      this.get('parentView.controller').send('addToSelection', this.get('context'));
    }

  })
});
