export default Ember.ObjectController.extend({
  controlTypeGroups: null,
  editingControl   : null,

  actions: {
    updateType: function () {
      this.get('model').save().then(function () {
        window.ENV.sendGruntCommand('scaffolding:' + this.get('model.name'));
        this.transitionToRoute('wh.content');
      }.bind(this));
    },
    addControl: function (controlType) {
      var controls, control;

      controls = this.get('model.controls');

      control = this.store.createRecord('control', {
        controlType: controlType,
        showInCms: (controls.get('length') < 3)
      });

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
    quitForm: function () {
      this.transitionToRoute('wh.content');
    }
  }
});
