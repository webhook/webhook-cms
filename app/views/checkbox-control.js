export default Ember.Checkbox.extend({

  defaultChanged: function () {
    this.set('checked', this.get('defaultValue'));
  }.observes('defaultValue'),

  willInsertElement: function () {
    if (this.get('checked') === undefined && this.get('defaultValue')) {
      this.set('checked', this.get('defaultValue'));
    }
  }

});
