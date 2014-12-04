export default Ember.Component.extend({
  actions: {
    addControl: function (widget) {

      var store = this.get('store');

      var controlType = store.getById('control-type', widget);

      var subControl = store.createRecord('control', {
        label      : controlType.get('name'),
        controlType: controlType
      });

      window.console.log(controlType, subControl);

      this.get('control.controls').pushObject(subControl);

    }
  }
});
