export default Ember.ObjectController.extend({
  controlTypeGroups: null,
  editingControl   : null,

  actions: {
    updateType: function () {

      this.get('model.controls').forEach(function (control) {
        // hax
        // firebase doesn't like undefined values and for some reason `_super` is
        // being added to arrays in ember with undefined value
        if (control.get('controlType.widget') === 'radio' || control.get('controlType.widget') === 'checkbox') {
          delete control.get('meta.data.options')._super;
        }
      });

      this.get('model').save().then(function () {
        window.ENV.sendGruntCommand('scaffolding:' + this.get('model.name'));
        this.send('notify', 'success', 'Form saved!');
        this.transitionToRoute('wh.content.type.index', this.get('content'));
      }.bind(this));
    },
    addControl: function (controlType) {
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

      controls.pushObject(control);
    },
    deleteControl: function (control) {
      this.get('model.controls').removeObject(control);
      control.destroyRecord();
      this.send('stopEditing');
    },
    editControl: function (control) {
      if (!control.get('meta')) {
        control.set('meta', this.store.createRecord('meta-data'));
      }
      this.set('editingControl', control);
    },
    stopEditing: function () {
      this.set('editingControl', null);
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
