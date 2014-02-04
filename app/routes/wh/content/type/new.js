export default Ember.Route.extend({
  model: function () {
    return this.modelFor('wh.content.type');
  },
  setupController: function (controller, model) {
    model.get('controls').forEach(function (control) {
      var value = '';
      switch (control.get('controlType.valueType')) {
      case 'object':
        value = {};
        break;
      case 'string':
        value = '';
        break;
      }
      control.set('value', value);
    });
    this._super.apply(this, arguments);
  }
});
