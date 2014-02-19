export default Ember.Component.extend({
  classNames: ['wy-control-group'],
  classNameBindings: ['control.required:wy-control-group-required', 'isEditingThis:wy-control-group-edit'],
  isEditingThis: false,

  controlChanged: function () {
    this.set('isEditingThis', this.get('isEditing') && this.get('control') === this.get('editingControl'));
  }.observes('control', 'editingControl', 'isEditing'),

  didInsertElement: function () {
    if (this.get('doEdit')) {
      this.$(this.get('element')).tooltip({
        placement: 'left',
        title: 'Click to edit field details.'
      });
    }
  },

  click: function () {
    this.sendAction('doEdit', this.get('control'));
  },

  notify: 'notify',

  actions: {
    notify: function (type, message) {
      this.sendAction('notify', type, message);
    }
  }
});
