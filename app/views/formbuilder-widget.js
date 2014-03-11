import WidgetView from 'appkit/views/widget';

export default WidgetView.extend({
  tagName: 'li',

  // additional formbuilder classes
  classNameBindings: [
    'isEditing:wy-control-group-edit',
    'isPlaced:wy-control-group-placed'
  ],

  isEditing: function () {
    return this.get('controller.isEditing') && this.get('context') === this.get('controller.editingControl');
  }.property('controller.editingControl', 'controller.isEditing'),

  prepForDelete: function () {
    this.$().height(this.$().height());
    this.$().addClass('wy-control-group-removed');
    this.$().height(0);
  }.observes('context.justDeleted'),

  didInsertElement: function () {

    var collectionView = this.get('parentView');

    if (collectionView.get('initialControlsAdded') === collectionView.get('initialControlsLength')) {
      this.set('isPlaced', true);
      this.set('addedTimeout', Ember.run.later(this, function () {
        this.set('isPlaced', false);
      }, collectionView.get('animationLength')));
    } else {
      collectionView.incrementProperty('initialControlsAdded');
    }

    if (this.get('context.hidden')) {
      this.$().hide();
    } else {
      this.$(this.get('element')).tooltip({
        placement: 'left',
        title: 'Click to edit field details.'
      });
    }

  },

  willDestroyElement: function () {
    Ember.run.cancel(this.get('addedTimeout'));
  },

  click: function () {
    this.get('controller').send('editControl', this.get('context'));
  }

});
