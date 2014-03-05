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

    this._super.apply(this, arguments);
  }
});
