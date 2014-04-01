export default Ember.Route.extend({
  beforeModel: function () {
    var promises = [this.store.find('control-type')];

    promises.push(this.store.find('content-type').then(function (contentTypes) {
      this.set('contentTypes', contentTypes);
    }.bind(this)));

    return Ember.RSVP.all(promises);
  },
  model: function (params) {
    return this.store.getById('content-type', params.id);
  },
  setupController: function (controller, model) {
    controller.set('editingControl', null);
    controller.set('isEditing', false);

    controller.set('controlTypeGroups', this.store.find('control-type-group'));
    controller.set('contentTypes', this.get('contentTypes'));

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
