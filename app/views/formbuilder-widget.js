import WidgetView from 'appkit/views/widget';

export default WidgetView.extend({
  tagName: 'li',

  classNameBindings: [
    'control.required:wy-control-group-required',
    'control.widgetIsValid::wy-control-group-error',
    'isEditing:wy-control-group-edit',
    'isPlaced:wy-control-group-placed'
  ],

  isPlaced: true,

  isEditing: function () {
    return this.get('controller.isEditing') && this.get('control') === this.get('controller.editingControl');
  }.property('controller.editingControl', 'controller.isEditing'),

  prepForDelete: function () {
    this.$().height(this.$().height());
    this.$().addClass('wy-control-group-removed');
    this.$().height(0);
  }.observes('control.justDeleted'),

  didInsertElement: function () {
    this.$(this.get('element')).tooltip({
      placement: 'left',
      title: 'Click to edit field details.'
    });
    this.set('addedTimeout', Ember.run.later(this, function () {
      this.set('isPlaced', false);
    }, 500));
  },

  willDestroyElement: function () {
    Ember.run.cancel(this.get('addedTimeout'));
  },

  click: function () {
    this.get('controller').send('editControl', this.get('control'));
  }

});
