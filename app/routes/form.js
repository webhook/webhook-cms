export default Ember.Route.extend({
  beforeModel: function () {
    return this.store.find('control-type');
  },
  model: function (params) {
    return this.store.find('content-type', params.id);
  },
  setupController: function (controller, model) {
    controller.set('editingControl', null);
    controller.set('isEditing', false);
    controller.set('controlTypeGroups', this.get('store').find('control-type-group'));

    model.get('controls').setEach('widgetIsValid', true);
    model.get('controls').setEach('value', null);

    model.get('controls').filterBy('controlType.widget', 'checkbox').forEach(function (control) {
      control.get('meta.data.options').setEach('value', undefined);
    });

    model.get('controls').filterBy('controlType.widget', 'tabular').forEach(function (control) {

      var value = Ember.A([]);
      var emptyRow = Ember.A([]);
      control.get('meta.data.options').forEach(function () {
        emptyRow.pushObject("");
      });
      value.pushObject(emptyRow);

      control.set('value', value);

    });

    this._super.apply(this, arguments);
  }
});
