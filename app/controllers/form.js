export default Ember.ObjectController.extend({
  fieldTypeGroups: null,
  editingField   : null,

  actions: {
    updateType: function () {
      this.get('model.fields').forEach(function (field) {
        field.save();
      });
      this.get('model').save().then(function () {
        this.transitionToRoute('wh.content');
      }.bind(this));
    },
    addField: function (fieldType) {
      var field = this.store.createRecord('field', {
        fieldType: fieldType
      });
      this.get('model.fields').pushObject(field);
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
