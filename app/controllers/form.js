export default Ember.ObjectController.extend({
  fieldTypeGroups: null,
  editingField   : null,

  actions: {
    updateType: function () {
      this.get('model').save().then(function () {
        window.ENV.sendGruntCommand('scaffolding:' + this.get('model.name'));
        this.transitionToRoute('wh.content');
      }.bind(this));
    },
    addField: function (fieldType) {
      var fields, field;

      fields = this.get('model.fields');

      field = this.store.createRecord('field', {
        fieldType: fieldType,
        showInCms: (fields.get('length') < 3)
      });

      fields.pushObject(field);
    },
    deleteField: function (field) {
      this.get('model.fields').removeObject(field);
      field.destroyRecord();
      this.send('stopEditing');
    },
    editField: function (field) {
      this.set('editingField', field);
    },
    stopEditing: function () {
      this.set('editingField', null);
    },
    quitForm: function () {
      this.transitionToRoute('wh.content');
    }
  }
});
