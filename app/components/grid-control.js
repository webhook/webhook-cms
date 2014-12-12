export default Ember.Component.extend({

  actions: {

    // formbuilder
    addControl: function (widget) {

      var store = this.get('store');

      var controlType = store.getById('control-type', widget);

      var subControl = store.createRecord('control', {
        label      : controlType.get('name'),
        controlType: controlType
      });

      this.get('control.controls').pushObject(subControl);

    },

    // For edit page
    addRow: function () {
      this.get('control.value').pushObject(Ember.Object.create({}));
    },

    removeRow: function (rowValues) {
      this.get('control.value').removeObject(rowValues);
    }

  }

});
