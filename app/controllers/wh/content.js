export default Ember.ArrayController.extend({
  actions: {
    deleteType: function (contentType) {
      this.removeObject(contentType);
    },
    gotoEdit: function (name) {
      this.transitionToRoute('form', name);
    }
  }
});
