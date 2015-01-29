export default Ember.View.extend({
  tagName: "input",
  type   : "radio",

  attributeBindings: [
    "name",
    "type",
    "value",
    "checked:checked:",
    "disabled:disabled"
  ],

  click: function () {
    this.set('selection', this.get('value'));
  },

  checked: function () {
    return this.get('value') === this.get('selection');
  }.property('selection'),

  defaultChanged: function () {
    this.set('selection', this.get('defaultValue'));
  }.observes('defaultValue'),

  valueChanged: function () {
    this.set('defaultValue', this.get('value'));
  }.observes('value'),

  willInsertElement: function () {
    if (!this.get('selection') && this.get('defaultValue')) {
      this.set('selection', this.get('defaultValue'));
    }
  }
});
