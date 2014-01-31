export default Ember.Component.extend({
  classNames: ['wy-control-group'],
  classNameBindings: ['control.required:wy-control-group-required', 'isEditing:wy-control-group-edit'],
  isEditing: false,

  controlChanged: function () {
    this.set('isEditing', this.get('control') === this.get('editingControl'));
  }.observes('control', 'editingControl'),

  didInsertElement: function () {
    if (this.get('doEdit')) {
      this.$(this.get('element')).tooltip({
        placement: 'left',
        title: 'Click to edit control details.'
      });
    }
  },

  click: function () {
    this.sendAction('doEdit', this.get('control'));
  }
});
