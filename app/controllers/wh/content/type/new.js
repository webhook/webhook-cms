export default Ember.ObjectController.extend({
  type: null,

  actions: {
    createItem: function () {

      this.set('saved', null);

      var self = this,
          data = {};

      this.get('model.fields').filterBy('value').forEach(function (item) {
        data[item.name] = item.value;
      });

      var newItemRef = new Firebase(window.ENV.firebase + "data/" + this.get('model.name')).push();

      var newItem = EmberFire.Object.create({ ref: newItemRef });

      newItem.setProperties($.extend(data, { id: newItemRef.name() }));

      this.transitionToRoute('wh.content.type', this.get('type.name'));

    }
  }
});
