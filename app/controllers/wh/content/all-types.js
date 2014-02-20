export default Ember.ArrayController.extend({
  actions: {
    deleteType: function (contentType) {
      this.removeObject(contentType);
      contentType.destroyRecord();
    },
    gotoEdit: function (name) {
      this.transitionToRoute('form', name);
    }
  }
});
