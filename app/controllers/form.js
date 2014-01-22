export default Ember.ObjectController.extend({
  ref            : null,
  fieldTypeGroups: null,
  editingField   : null,

  actions: {
    updateType: function () {
      var self = this,
          data = this.get('model').serialize();

      this.get('ref').set(data, function (error) {
        if (error) {
          // Todo: actual error handling.
          window.alert('firebase error, see console.');
          window.console.log(error);
        } else {
          self.transitionToRoute('wh.content');
        }
      });

    },
    addField: function (fieldType) {
      var field = this.get('store').createRecord('field', {
        type: fieldType
      });
      this.get('model.fields').pushObject(field);
    },
    deleteField: function (field) {
      this.get('model.fields').removeObject(field);
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
