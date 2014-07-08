export default Ember.Route.extend({
  beforeModel: function (transition) {

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

    controller.set('addedControls', Ember.A([]));
    controller.set('removedControls', Ember.A([]));
    controller.set('changedNameControls', Ember.A([]));
    controller.set('changedRadioControls', Ember.A([]));

    model.get('controls').forEach(function (control) {
      control.set('originalName', control.get('name'));
    });

    controller.set('isEditingTypeId', false);

    controller.set('editingControl', null);
    controller.set('isEditing', false);

    controller.set('controlTypeGroups', this.store.find('control-type-group'));

    if (this.get('session.supportedMessages.layouts')) {

      if (model.get('oneOff') || model.get('controls').isAny('controlType.widget', 'layout')) {
        this.store.getById('control-type', 'layout').set('isHidden', true);
      } else {
        this.store.getById('control-type', 'layout').set('isHidden', false);
      }

    } else {

      this.store.getById('control-type', 'layout').set('isHidden', true);

    }

    controller.set('contentTypes', this.get('contentTypes'));

    model.get('controls').setEach('widgetIsValid', true);
    model.get('controls').setEach('value', null);

    model.get('controls').filterBy('controlType.widget', 'checkbox').forEach(function (control) {
      control.get('meta.data.options').setEach('value', undefined);
    });

    model.get('controls').filterBy('controlType.widget', 'radio').forEach(function (control) {
      control.set('originalOptions', control.get('meta.data.options').getEach('value'));
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
