export default Ember.ObjectController.extend({
  fieldTypeGroups: null,
  editingField   : null,

  actions: {
    updateType: function () {

      var fields = this.get('model.fields'),
          count = fields.get('length');

      var saveType = function () {
        // Save form and transition back
        this.get('model').save().then(function () {
          this.transitionToRoute('wh.content');
        }.bind(this));
      }.bind(this);

      // Can't think of a better way to automatically do this at the moment.
      fields.forEach(function (field) {
        field.save().then(function () {
          count--;
          if (!count) {
            saveType();
          }
        });
      }.bind(this));

    },
    addField: function (fieldType) {
      var field = this.store.createRecord('field', {
        type: fieldType
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
    }
  }
});
