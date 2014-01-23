export default Ember.ObjectController.extend({
  type: null,

  // addingFields: function () {
  //   if (this.get('type.fields.length') && this.get('model.id')) {

  //     window.console.log('bang');

  //     var model = this.get('model');
  //     this.get('type.fields').forEach(function (field) {
  //       field.set('value', 'hey');
  //       // if (model.get(field.get('name'))) {
  //       //   field.set('value', model.get(field.get('name')));
  //       // }
  //     });
  //   }
  // }.observes('type.fields', 'model.id'),

  actions: {
    saveItem: function () {

      this.set('saved', null);

      var self = this,
          data = {};

      this.get('type.fields').filterBy('value').forEach(function (item) {
        data[item.name] = item.value;
      });

      window.console.log(data);

      // var itemRef = new Firebase(window.ENV.firebase + "data/" + this.get('model.name'));

      // var item = EmberFire.Object.create({ ref: itemRef });

      // item.setProperties(data);

      // this.transitionToRoute('wh.content.type', this.get('type.name'));

    }
  }
});
