export default Ember.View.extend({
  tagName: 'form',
  classNames: ['wy-form-stacked'],

  submit: function (event) {
    event.preventDefault();
    this.$().triggerHandler('submit');
    this.get('controller').saveItem();
  }
});
