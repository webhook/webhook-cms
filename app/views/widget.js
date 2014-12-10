export default Ember.View.extend({
  templateName: 'components/formbuilder-widget',
  classNames: ['wy-control-group'],

  classNameBindings: [
    'context.required:wy-control-group-required',
    'context.hidden:wy-control-group-hidden',
    'context.widgetIsValid::wy-control-group-error',
    'controlClass',
    'context.disabled:wy-control-group-disabled'
  ],

  control: function () {
    return this.get('context');
  }.property(),

  controlClass: function () {
    return 'wy-control-group-' + this.get('context.controlType.widget');
  }.property(),

  didInsertElement: function () {
    if (this.get('context.name') === 'name') {
      this.$().hide();
    }
  },

  willInsertElement: function () {
    this.set('context.isInGrid', this.get('parentView.isInGrid'));
  }

});
