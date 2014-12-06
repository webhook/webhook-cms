export default Ember.Component.extend({

  willInsertElement: function () {
    window.console.log('grid-control', this.get('control.value'));
  },

  actions: {
    addControl: function (widget) {

      var store = this.get('store');

      var controlType = store.getById('control-type', widget);

      var subControl = store.createRecord('control', {
        label      : controlType.get('name'),
        controlType: controlType
      });

      this.get('control.controls').pushObject(subControl);

    },

    addRow: function () {
      window.console.log(this.get('control.value'));
      this.get('control.value').pushObject({});
    }
  }

});
