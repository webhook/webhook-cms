export default Ember.ObjectController.extend(Ember.Evented, {
  controlTypeGroups: null,
  editingControl   : null,
  isEditing        : false,

  updateOrder: function (originalindex, newindex) {

    var controls = this.get('model.controls'),
        control = controls.objectAt(originalindex);

    controls.removeAt(originalindex);
    controls.insertAt(newindex, control);

  },

  addControlAtIndex: function (controlTypeId, index) {
    this.store.find('control-type', controlTypeId).then(function (controlType) {
      this.addControl(controlType, index);
    }.bind(this));
  },

  addControl: function (controlType, index) {

    var controls, control;

    controls = this.get('model.controls');

    control = this.store.createRecord('control', {
      label: controlType.get('name'),
      controlType: controlType,
      showInCms: (controls.get('length') < 3)
    });

    var meta = this.store.createRecord('meta-data');

    switch (controlType.get('widget')) {
      case 'radio':
      case 'select':
        meta.set('data', {
          options: [
            { value: 'Option 1' },
            { value: 'Option 2' }
          ]
        });
        break;
      case 'checkbox':
        meta.set('data', {
          options: [
            { label: 'Option 1' },
            { label: 'Option 2' }
          ]
        });
        break;
    }

    control.set('meta', meta);

    if (index) {
      controls.insertAt(index, control);
    } else {
      controls.pushObject(control);
    }

  },

  actions: {
    updateType: function () {

      this.get('model.controls').forEach(function (control) {
        // hax
        // firebase doesn't like undefined values and for some reason `_super` is
        // being added to arrays in ember with undefined value
        if (Ember.isArray(control.get('meta.data.options'))) {
          delete control.get('meta.data.options')._super;
        }
      });

      this.get('model').save().then(function () {
        window.ENV.sendGruntCommand('scaffolding:' + this.get('model.name'));
        this.send('notify', 'success', 'Form saved!');
        this.transitionToRoute('wh.content.type.index', this.get('content'));
      }.bind(this));

    },

    addControl: function (controlType, index) {
      this.addControl.apply(this, arguments);
    },

    deleteControl: function (control) {

      control.set('justDeleted', true);

      setTimeout(function () {
        this.get('model.controls').removeObject(control);
      }.bind(this), 500);

      this.set('editingControl', null);
      this.send('stopEditing');

    },

    editControl: function (control) {
      if (!control.get('meta')) {
        control.set('meta', this.store.createRecord('meta-data'));
      }
      this.set('editingControl', control);
      this.set('isEditing', true);
    },

    stopEditing: function () {
      this.set('isEditing', false);
    },

    startEditing: function () {
      if (!this.get('editingControl')) {
        this.set('editingControl', this.get('model.controls.firstObject'));
      }
      this.set('isEditing', true);
    },

    addOption: function (array) {
      array.pushObject({});
    },

    removeOption: function (array, option) {
      array.removeObject(option);
    },

    quitForm: function () {
      this.transitionToRoute('wh.content.all-types');
    }
  }
});
