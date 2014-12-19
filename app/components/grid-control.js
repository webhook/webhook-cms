export default Ember.Component.extend({

  activeRows: Ember.A([]),

  focusOnRow: 0,

  didInsertElement: function () {
    this.get('activeRows').addObject('%@-%@'.fmt(this.get('control.name'), this.get('control.value.length') - 1));
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

      this.get('activeRows').pushObject('%@-%@'.fmt(this.get('control.name'), index));
      this.set('focusOnRow', index);

    },

    removeRow: function (rowValues) {
      if (!window.confirm('Are you sure you would like to remove this row?')) {
        return;
      }
      this.get('control.value').removeObject(rowValues);
    },

    activateRow: function (index) {
      this.get('activeRows').addObject('%@-%@'.fmt(this.get('control.name'), index));
    },

    deactivateRow: function (index) {
      this.get('activeRows').removeObject('%@-%@'.fmt(this.get('control.name'), index));
    },

    toggleRow: function (index) {
      if (this.get('activeRows').contains('%@-%@'.fmt(this.get('control.name'), index))) {
        this.send('deactivateRow', index);
      } else {
        this.send('activateRow', index);
      }
    }

  }

});
