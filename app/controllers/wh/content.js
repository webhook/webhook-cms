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

      // controls that are locked
      var controls = [
        this.store.createRecord('control', {
          controlType: this.store.getById('control-type', 1),
          name       : 'name',
          label      : 'Name',
          locked     : true,
          showInCms  : true
        })
      ];

      // creating a new content-type
      // a textcontrol (name) is required
      var type = this.store.createRecord('content-type', {
        id: this.get('newTypeName'),
        name: this.get('newTypeName')
      });

      type.get('controls').pushObjects(controls);

      type.save().then(function (type) {
        this.transitionToRoute('form', type);
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
