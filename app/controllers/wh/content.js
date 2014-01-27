export default Ember.ArrayController.extend({
  newTypeName: null,

  // force a valid name
  forceValid: function () {
    var name = this.get('newTypeName'),
        regex = /(\W|[A-Z])/g;
    if (name && regex.test(name)) {
      this.set('newTypeName', name.replace(regex, ''));
    }
  }.observes('newTypeName'),

  actions: {
    createType: function () {
      this.store.createRecord('content-type', {
        id: this.get('newTypeName'),
        name: this.get('newTypeName')
      }).save().then(function (type) {
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
