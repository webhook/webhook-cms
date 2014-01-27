export default Ember.ArrayController.extend({
  newTypeName: null,

  actions: {
    createType: function () {
      this.store.createRecord('content-type', {
        id: this.get('newTypeName'),
        name: this.get('newTypeName')
      }).save().then(function (type) {
        this.transitionTo('form', type);
      }.bind(this));
    },
    deleteType: function (contentType) {
      this.removeObject(contentType);
    },
    gotoEdit: function (name) {
      this.transitionTo('form', name);
    }
  }
});
