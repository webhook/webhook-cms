export default Ember.ObjectController.extend({
  type: null,

  actions: {
    saveItem: function () {

      var data = {};

      this.get('type.fields').filterBy('value').forEach(function (field) {
        data[field.get('name')] = field.get('value');
      });

      this.get('model').setProperties({
        data: data
      }).save().then(function () {
        this.transitionToRoute('wh.content.type', this.get('type'));
      }.bind(this));

    }
  }
});
