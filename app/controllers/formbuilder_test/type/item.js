export default Ember.ObjectController.extend({
  contentType: null,
  saved: null,
  actions: {
    createItem: function () {

      this.set('saved', null);

      var self = this,
          data = {};

      this.get('model.fields').filterBy('value').forEach(function (item) {
        data[item.name] = item.value;
      });

      var dataRef = new Firebase(window.ENV.firebase + "data/" + this.get('model.name')).push(data, function (error) {
        if (error) {
          // handle this
        } else {
          self.set('saved', 'success!');
          self.get('model.fields').setEach('value', '');
        }
      });
    }
  }
});
