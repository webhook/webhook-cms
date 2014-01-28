export default Ember.Component.extend({
  classNames: ['wy-control-group'],
  classNameBindings: ['field.required:wy-control-group-required', 'isEditing:wy-control-group-edit'],
  isEditing: false,

  fieldChanged: function () {
    this.set('isEditing', this.get('field') === this.get('editingField'));
  }.observes('field', 'editingField'),

  didInsertElement: function () {
    if (this.get('doEdit')) {
      this.$(this.get('element')).tooltip({
        placement: 'left',
        title: 'Click to edit field details.'
      });
    }
  },

  click: function () {
    this.sendAction('doEdit', this.get('field'));
  }
});
