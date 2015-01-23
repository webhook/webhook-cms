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
  }

});
