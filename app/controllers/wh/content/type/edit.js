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

      this.get('model').setProperties({
        data: data
      }).save().then(function () {
        this.get('type.controls').setEach('value', null);

        window.ENV.sendBuildSignal();

        this.transitionToRoute('wh.content.type', this.get('type'));
      }.bind(this));

    }
  }
});
