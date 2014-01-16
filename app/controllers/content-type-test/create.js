export default Ember.ObjectController.extend({
  ref: null,
  fieldTypes: null,
  actions: {
    createModel: function () {
      var self = this,
          contentType = this.get('model');

      if (!contentType.get('name')) {
        return;
      }

      contentType.set('name', contentType.get('name').toLowerCase());

      this.get('ref').child(contentType.get('name')).set(contentType.serialize(), function (error) {
        if (error) {
        } else {
          self.transitionTo('content-type-test.type', contentType.get('name'));
        }
      });

    },
    addField: function (fieldType) {
      var field = this.get('store').createRecord('field', {
        type: fieldType
      });
      this.get('model.fields').pushObject(field);
    }
  }
});
