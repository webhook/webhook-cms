export default Ember.Checkbox.extend({

  stateChanged: function () {
    this.set('option.value', this.get('checked'));
    this.set('control.value', this.get('control.meta.options').map(function (option) {
      return { label: option.label, value: option.value };
    }).toArray());
  }.observes('checked'),

  defaultChanged: function () {
    this.set('checked', this.get('option.defaultValue'));
  }.observes('option.defaultValue'),

  willInsertElement: function () {
    if (this.get('option.value') === undefined) {
      this.set('checked', this.getWithDefault('option.defaultValue', false));
    }
  }

});
