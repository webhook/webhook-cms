import MetaWithOptions from 'appkit/utils/meta-options';

export default Ember.Route.extend({
  beforeModel: function (transition) {

    var formRoute = this;

    var promises = [this.store.find('control-type')];

    promises.push(this.store.find('control-type-group').then(function (controlTypeGroups) {
      formRoute.set('controlTypeGroups', controlTypeGroups);
    }));

    promises.push(this.store.find('content-type').then(function (contentTypes) {
      formRoute.set('contentTypes', contentTypes);
    }));

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
    controller.set('changedRelationTypeControls', Ember.A([]));

    // Save original name for comparison when saving
    // If control name changes, data keys must be updated
    model.get('controls').forEach(function (control) {
      control.set('originalName', control.get('name'));
    });

    // Save original related content types for comparison when saving
    // If contentTypeId changes
    // - old reverse relations must be removed
    // - new reverse relations must be added
    model.get('controls').filterBy('controlType.widget', 'relation').forEach(function (control) {
      control.set('originalRelatedContentTypeId', control.get('meta.contentTypeId'));
      control.set('originalRelatedIsSingle', control.get('meta.isSingle'));
    });

    controller.set('isEditingTypeId', false);

    controller.set('editingControl', null);
    controller.set('isEditing', false);

    controller.set('controlTypeGroups', this.get('controlTypeGroups'));

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

    // controls with meta.options (checkbox, radio, tabular, select)
    // get special treatment
    model.get('controls').filter(function (control) {
      switch (control.get('controlType.widget')) {
        case 'checkbox':
        case 'radio':
        case 'select':
        case 'tabular':
        case 'layout':
          return true;
        default:
          return false;
      }
    }).forEach(function (control) {
      control.set('meta', MetaWithOptions.create(control.get('meta')));
    });

    model.get('controls').filterBy('controlType.widget', 'checkbox').forEach(function (control) {
      control.get('meta.options').setEach('value', undefined);
    });

    model.get('controls').filterBy('controlType.widget', 'radio').forEach(function (control) {
      control.set('originalOptions', control.get('meta.options').getEach('value'));
    });

    model.get('controls').filterBy('controlType.widget', 'tabular').forEach(function (control) {

      var value = Ember.A([]);
      var emptyRow = Ember.A([]);
      control.get('meta.options').forEach(function () {
        emptyRow.pushObject("");
      });
      value.pushObject(emptyRow);

      control.set('value', value);

    });

    if (typeof model.get('customUrls') === 'undefined') {
      model.set('customUrls', {
        individualUrl: null,
        listUrl: null
      });
    }

    this._super.apply(this, arguments);
  }
});
