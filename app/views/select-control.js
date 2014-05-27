export default Ember.Select.extend({

  // the default only changes when you're on the form builder
  // visually reflect change
  defaultChanged: function () {
    this.set('value', this.get('defaultValue'));
  }.observes('defaultValue'),

  didInsertElement: function () {
    this._super.apply(this, arguments);

    // make sure the control (context) value matches selection
    this.addObserver('value', function () {
      this.set('context.value', this.get('value'));
    });

    // if we have a starting value, use that in the select
    if (this.get('context.value')) {
      this.set('value', this.get('context.value'));
    }

    // if we don't have a starting value, use the default
    else if (this.get('defaultValue') && this.get('context.value') === undefined && this.get('context.value') !== this.get('defaultValue')) {
      this.set('context.value', this.get('defaultValue'));
    }

    // if not starting value and no default value, just use the first item
    else {
      this.set('context.value', this.get('content.firstObject.value'));
    }
  }

});
