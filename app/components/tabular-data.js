export default Ember.Component.extend({
  actions: {
    addTabularRow: function (control) {
      var emptyRow = Ember.A([]);
      control.get('meta.options').forEach(function () {
        emptyRow.pushObject(Ember.Object.create());
      });
      control.get('value').pushObject(emptyRow);
    },

    removeTabularRow: function (row, control) {
      control.get('value').removeObject(row);
    }
  }
});
