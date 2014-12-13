export default Ember.Component.extend({

  activeRows: Ember.A([]),

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
    addRow: function (index) {
      if (index) {
        this.get('control.value').insertAt(index, Ember.Object.create({}));
      } else {
        this.get('control.value').pushObject(Ember.Object.create({}));
      }
    },

    removeRow: function (rowValues) {
      this.get('control.value').removeObject(rowValues);
    },

    activateRow: function (index) {
      this.get('activeRows').addObject(index);
    },

    deactivateRow: function (index) {
      this.get('activeRows').removeObject(index);
    }

  }

});
