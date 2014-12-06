import WidgetView from 'appkit/views/widget';

export default WidgetView.extend({
  tagName: 'li',

  // additional formbuilder classes
  classNameBindings: [
    'isEditing:wy-control-group-edit',
    'isPlaced:wy-control-group-placed',
    'controlClass',
    'controlName'
  ],

  controlClass: function () {
    return 'wy-control-group-' + this.get('context.controlType.widget');
  }.property(),

  controlName: function () {
    return 'wy-control-name-' + this.get('context.name');
  }.property('context.name'),

  isEditing: function () {
    return this.get('controller.isEditing') && this.get('context') === this.get('controller.editingControl');
  }.property('controller.editingControl', 'controller.isEditing'),

  prepForDelete: function () {
    this.$().height(this.$().height());
    this.$().addClass('wy-control-group-removed');
    this.$().height(0);
  }.observes('context.justDeleted'),

  willInsertElement: function () {
    this.set('context.isInFormbuilder', true);
  },

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

    if (this.get('context.hidden') && this.get('context.controlType.widget') !== 'relation') {
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

    // kind of a hack to get to the controller of either nested grid control or top level control
    var controller = this.get('parentView.parentView.parentView.parentView.controller') || this.get('controller');

    controller.send('editControl', this.get('context'));

    // do not bubble
    return false;
  }

});
