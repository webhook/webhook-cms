export default Ember.CollectionView.extend({
  tagName: 'tbody',
  contentType: null,

  itemViewClass: Ember.View.extend({
    click: function () {
      this.get('parentView.controller')
        .transitionToRoute('wh.content.type.edit', this.get('parentView.contentType.id'), this.get('context.id'));
    }
  })
});
