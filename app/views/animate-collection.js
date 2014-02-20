export default Ember.CollectionView.extend({
  tagName: "ul",
  initialsAdded: 0,
  animationLength: 500,

  itemViewClass: Ember.View.extend({
    classNames: ['wy-animate-add'],
    didInsertElement: function () {
      var collectionView = this.get('parentView');
      if (collectionView.get('initialsAdded') === collectionView.get('initialLength')) {
        this.$().addClass('wy-just-added');
        this.set('addedTimeout', setTimeout(function () {
          this.$().removeClass('wy-just-added');
        }.bind(this), this.get('animationLength')));
      } else {
        collectionView.incrementProperty('initialsAdded');
      }

      this.get('context').on('didUpdate', function () {
        this.$().addClass('wy-just-updated');
        this.set('updatedTimeout', setTimeout(function () {
          this.$().removeClass('wy-just-updated');
        }.bind(this), this.get('animationLength')));
      }.bind(this));

    },
    willDestroyElement: function () {
      this.get('context').off('didUpdate');
      window.clearTimeout(this.get('addedTimeout'));
      window.clearTimeout(this.get('updateTimeout'));
    }
  }),
  willInsertElement: function () {
    this.set('initialLength', this.get('content.length'));
  }
});
