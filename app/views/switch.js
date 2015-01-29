export default Ember.View.extend({

  tagName: 'div',

  classNameBindings: [
    ':wy-switch',
    'control.value:active',
    'control.disabled:disabled'
  ],

  click: function () {

    if (this.get('control.disabled')) {
      return;
    }

    this.toggleProperty('control.value');

    return false;
  },

  // The control value will not be set in the formbuilder
  willInsertElement: function () {
    if (Ember.isEmpty(this.get('control.value'))) {
      this.set('control.value', this.get('control.meta.defaultValue'));
    }
  },

  // In the formbuilder we want to show the default value change
  defaultSet: function () {
    this.set('control.value', this.get('control.meta.defaultValue'));
  }.observes('control.meta.defaultValue')

});
