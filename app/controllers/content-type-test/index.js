export default Ember.ArrayController.extend({
  actions: {
    deleteModel: function (contentType) {
      this.removeObject(contentType);
    }
  }
});
