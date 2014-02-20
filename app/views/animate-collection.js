export default Ember.CollectionView.extend({
  tagName: "ul",
  initialsAdded: 0,
  itemViewClass: Ember.View.extend({
    classNames: ['wy-animate-add'],
    didInsertElement: function () {
      var collectionView = this.get('parentView');
      if (collectionView.get('initialsAdded') === collectionView.get('initialLength')) {
        this.$().addClass('wy-just-added');
        this.set('addedTimeout', setTimeout(function () {
          this.$().removeClass('wy-just-added');
        }.bind(this), 500));
      } else {
        collectionView.incrementProperty('initialsAdded');
      }
    },
    willDestroyElement: function () {
      window.clearTimeout(this.get('addedTimeout'));
    }
  }),
  willInsertElement: function () {
    this.set('initialLength', this.get('content.length'));
  }
});
