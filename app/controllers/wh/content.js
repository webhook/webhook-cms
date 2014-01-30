export default Ember.ArrayController.extend({
  newTypeName: null,
  contentTypeNames: [],
  isDuplicate: false,

  // force a valid name
  forceValid: function () {
    var name = this.get('newTypeName'),
        regex = /(\W|[A-Z])/g;
    if (name && regex.test(name)) {
      this.set('newTypeName', name.replace(regex, ''));
    }
    this.set('isDuplicate', this.get('model').isAny('name', this.get('newTypeName')));
  }.observes('newTypeName'),

  actions: {
    createType: function () {

      if (this.get('isDuplicate')) {
        return;
      }

      this.store.find('field-type', 1).then(function (textField) {

        // fields that are locked
        var fields = [
          this.store.createRecord('field', {
            fieldType: textField,
            name: 'name',
            label: 'Name',
            locked: true,
            showInCms: true
          })
        ];

        // creating a new content-type
        // a textfield (name) is required
        var type = this.store.createRecord('content-type', {
          id: this.get('newTypeName'),
          name: this.get('newTypeName')
        });

        type.get('fields').pushObjects(fields);

        type.save().then(function (type) {
          this.transitionToRoute('form', type);
        }.bind(this));

      }.bind(this));

    },
    deleteType: function (contentType) {
      this.removeObject(contentType);
    },
    gotoEdit: function (name) {
      this.transitionToRoute('form', name);
    }
  }
});
