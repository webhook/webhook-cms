export default Ember.CollectionView.extend({
  tagName: "ul",
  initialsAdded: 0,
  animationLength: 5000,

  itemViewClass: Ember.View.extend({
    classNames: ['wy-animate-add'],
    didInsertElement: function () {
      var collectionView = this.get('parentView');

      if (collectionView.get('initialsAdded') === collectionView.get('initialLength')) {
        this.$().addClass('wy-just-added');
        this.set('addedTimeout', Ember.run.later(this, function () {
          this.$().removeClass('wy-just-added');
        }, collectionView.get('animationLength')));
      } else {
        collectionView.incrementProperty('initialsAdded');
      }

      this.get('context').on('didUpdate', function () {
        this.$().addClass('wy-just-updated');
        this.set('updatedTimeout', Ember.run.later(this, function () {
          this.$().removeClass('wy-just-updated');
        }, collectionView.get('animationLength')));
      }.bind(this));

    },
    willDestroyElement: function () {
      this.get('context').off('didUpdate');
      Ember.run.cancel(this.get('addedTimeout'));
      Ember.run.cancel(this.get('updatedTimeout'));
    }
  }),
  willInsertElement: function () {
    this.set('initialLength', this.get('content.length'));
  }
});
