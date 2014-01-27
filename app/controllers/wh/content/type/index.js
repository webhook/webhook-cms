export default Ember.ArrayController.extend({
  type: null,

  actions: {
    deleteItem: function (item) {
      this.removeObject(item);
    }
  }

});
