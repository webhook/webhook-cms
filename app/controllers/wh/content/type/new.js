import getItemModelName from 'appkit/utils/model';
import validateControl from 'appkit/utils/validators';

export default Ember.ObjectController.extend({

  // Run validators on every change.
  valueChanged: function () {
    this.get('model.controls').forEach(validateControl);
  }.observes('model.controls.@each.value'),

  actions: {
    createItem: function () {

      if (!this.get('model.controls').isEvery('isValid')) {
        window.alert('Fix your problems.');
        return;
      }

      var data = {};

      this.get('model.controls').filterBy('value').forEach(function (control) {
        data[control.get('name')] = control.get('value');
      });

      var modelName = getItemModelName(this.get('model'));

      this.store.createRecord(modelName, {
        data: data
      }).save().then(function () {
        window.ENV.sendBuildSignal();

        this.send('notify', 'success', 'Item created!');
        this.transitionToRoute('wh.content.type', this.get('model'));
      }.bind(this));

    }
  }
});
