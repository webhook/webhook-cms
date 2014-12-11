export default Ember.View.extend({

  templateName: 'components/formbuilder-widget',

  classNames: ['wy-control-group'],

  classNameBindings: [
    'content.required:wy-control-group-required',
    'content.hidden:wy-control-group-hidden',
    'content.widgetIsValid::wy-control-group-error',
    'controlClass',
    'content.disabled:wy-control-group-disabled'
  ],

  controlClass: function () {
    return 'wy-control-group-' + this.get('content.controlType.widget');
  }.property(),

  didInsertElement: function () {
    if (this.get('content.name') === 'name') {
      this.$().hide();
    }
  },

  willInsertElement: function () {
    // this.set('content.isInGrid', this.get('parentView.isInGrid'));
  },

  templateVar: function () {
    if (this.get('parentView.model.controlType.widget') === 'grid') {
      return '{{ item.%@.%@ }}'.fmt(this.get('parentView.model.name'), this.get('content.name'));
    } else {
      return '{{ item.%@ }}'.fmt(this.get('content.name'));
    }
  }.property('content.name', 'parentView.model.name')

});
