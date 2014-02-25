import validateControl from 'appkit/utils/validators';

export default Ember.ObjectController.extend({
  type: null,

  // Run validators on every change.
  valueChanged: function () {
    this.get('type.controls').forEach(validateControl);
  }.observes('type.controls.@each.value'),

  saveItem: function () {

    this.get('type.controls').forEach(validateControl);

    if (!this.get('type.controls').isEvery('isValid')) {
      window.alert('Fix your problems.');
      return;
    }

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

    this.get('model').set('data', data).save().then(function () {

      this.send('notify', 'success', 'Item saved!', {
        icon: 'ok-sign'
      });

      window.ENV.sendBuildSignal();

      if (!this.get('type.oneOff')) {
        this.get('type.controls').setEach('value', null);
        this.transitionToRoute('wh.content.type', this.get('type'));
      }
    }.bind(this));

  }
});
