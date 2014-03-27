export default Ember.Select.extend({

  // the default only changes when you're on the form builder
  // visually reflect change
  defaultChanged: function () {
    this.set('value', this.get('defaultValue'));
  }.observes('defaultValue'),

  willInsertElement: function () {

    if (this.get('context.value')) {
      this.set('value', this.get('context.value'));
    }

    else if (this.get('defaultValue') && this.get('context.value') === undefined && this.get('context.value') !== this.get('defaultValue')) {
      this.set('value', this.get('defaultValue'));
    }

  },

  didInsertElement: function () {
    this._super.apply(this, arguments);

    // make sure the control (context) value matches selection
    this.addObserver('value', function () {
      this.set('context.value', this.get('value'));
    });
  }

});
