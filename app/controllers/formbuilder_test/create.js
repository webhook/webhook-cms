export default Ember.ObjectController.extend({
  ref            : null,
  fieldTypeGroups: null,
  isEditing      : false,
  field          : null,

  actions: {
    createModel: function () {
      var self = this,
          contentType = this.get('model');

      contentType.set('name', contentType.get('name').toLowerCase());

      this.get('ref').child(contentType.get('name')).set(contentType.serialize(), function (error) {
        if (error) {
        } else {
          self.transitionTo('formbuilder_test.type', contentType.get('name'));
        }
      });

    },
    addField: function (fieldType) {
      var field = this.get('store').createRecord('field', {
        type       : fieldType,
        label      : fieldType.get('label'),
        placeholder: fieldType.get('placeholder'),
        help       : fieldType.get('help')
      });
      this.get('model.fields').pushObject(field);
    },
    deleteField: function (field) {
      this.get('model.fields').removeObject(field);
      this.send('stopEditing');
    },
    editField: function (field) {
      window.console.log(arguments);
      this.set('field', field);
      this.set('isEditing', true);
    },
    stopEditing: function () {
      this.set('isEditing', false);
    }
  }
});
