import WidgetView from 'appkit/views/widget';

export default WidgetView.extend({

  // additional formbuilder classes
  classNameBindings: [
    'isEditing:wy-control-group-edit',
    'isPlaced:wy-control-group-placed',
    'controlClass',
    'controlName'
  ],

  controlName: function () {
    return 'wy-control-name-%@'.fmt(this.get('content.name'));
  }.property('content.name'),

  isEditing: function () {
    return this.get('controller.isEditing') && this.get('content') === this.get('controller.editingControl');
  }.property('controller.editingControl', 'controller.isEditing'),

  prepForDelete: function () {
    this.$().height(this.$().height());
    this.$().addClass('wy-control-group-removed');
    this.$().height(0);
  }.observes('content.justDeleted'),

  willInsertElement: function () {
    this._super.apply(this, arguments);
    this.set('content.isInFormbuilder', true);
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

    if (this.get('content.hidden') && this.get('content.controlType.widget') !== 'relation') {
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

    var controller = this.get('controller');
    var control = this.get('content');
    var model = this.get('parentView.model');

    controller.send('editControl', control, model);

    // do not bubble
    return false;
  }

});
