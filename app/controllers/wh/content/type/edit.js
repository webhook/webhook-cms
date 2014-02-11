export default Ember.ObjectController.extend({
  type: null,

  actions: {
    saveItem: function () {

      var data = {};

      // gather and clean data for storage
      this.get('type.controls').filterBy('value').forEach(function (control) {
        var value = control.get('value');

        if (control.get('controlType.valueType') === 'object') {
          Ember.$.each(value, function (key, childValue) {
            if (!childValue) {
              delete value[key];
            }
          });
        }

        data[control.get('name')] = value;
      });

      // checkboxes are special
      this.get('type.controls').filterBy('controlType.widget', 'checkbox').forEach(function (control) {
        data[control.get('name')] = [];
        control.get('meta.data.options').forEach(function (option) {
          data[control.get('name')].push(option);
        });
      });

      this.get('model').setProperties({
        data: data
      }).save().then(function () {
        this.get('type.controls').setEach('value', null);

        window.ENV.sendBuildSignal();

        this.send('notify', 'success', 'Item saved!');
        this.transitionToRoute('wh.content.type', this.get('type'));
      }.bind(this));

    }
  }
});
