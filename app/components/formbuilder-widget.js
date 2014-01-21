export default Ember.Component.extend({
  classNames: ['wy-control-group'],
  classNameBindings: ['field.required:wy-control-group-required'],
  didInsertElement: function () {
    var self = this;
    this.$(this.get('element')).tooltip({
      placement: 'left',
      title: 'Click to edit field details.'
    });
  },
  click: function () {
    this.sendAction('doEdit', this.get('field'));
  }
});
