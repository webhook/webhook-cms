export default Ember.Select.extend({

  // the default only changes when you're on the form builder
  // visually reflect change
  defaultChanged: function () {
    this.set('value', this.get('defaultValue'));
  }.observes('defaultValue'),

  willInsertElement: function () {

    // if we don't have a starting value, use the default
    // value is null in formbuilder, undefined in new item for some reason.
    if (this.get('defaultValue') && (this.get('value') === null || this.get('value') === undefined)) {
      this.set('value', this.get('defaultValue'));
    }

    // if not starting value and no default value, just use the first item
    else if (this.get('defaultValue') === null || this.get('defaultValue') === undefined) {
      this.set('value', this.get('content.firstObject.value'));
    }
  }

});
