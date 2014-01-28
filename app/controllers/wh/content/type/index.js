export default Ember.ArrayController.extend({
  type: null,

  actions: {
    deleteItem: function (item) {
      item.destroyRecord();
    }
  }

});
