export default Ember.ObjectController.extend({
  ref: null,
  fieldTypes: null,
  actions: {
    createModel: function () {
      var self = this,
          contentType = this.get('model'),
          name = contentType.get('name');

      this.get('ref').child(name).set(contentType.serialize(), function (error) {
        if (error) {
        } else {
          self.transitionTo('content-type-test.type', name);
        }
      });

    },
    addField: function (field) {
      this.get('model.fields').pushObject(field);
    }
  }
});
