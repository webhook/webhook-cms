export default Ember.Component.extend({

  activeRows: Ember.A([]),

  focusOnRow: 0,

  didInsertElement: function () {
    this.get('activeRows').addObject(this.get('control.value.length') - 1);
  },

  willDestroyElement: function () {
    this.get('activeRows').clear();
  },

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

      this.get('activeRows').clear();

      if (index) {
        this.get('control.value').insertAt(index, Ember.Object.create({}));
      } else {
        this.get('control.value').pushObject(Ember.Object.create({}));
      }

      this.get('activeRows').pushObject(index);
      this.set('focusOnRow', index);

    },

    removeRow: function (rowValues) {
      this.get('control.value').removeObject(rowValues);
    },

    activateRow: function (index) {
      this.get('activeRows').addObject(index);
    },

    deactivateRow: function (index) {
      this.get('activeRows').removeObject(index);
    },

    toggleRow: function (index) {
      if (this.get('activeRows').contains(index)) {
        this.send('deactivateRow', index);
      } else {
        this.send('activateRow', index);
      }
    }

  }

});
