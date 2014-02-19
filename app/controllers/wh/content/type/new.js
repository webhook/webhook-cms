import getItemModelName from 'appkit/utils/model';

export default Ember.ObjectController.extend({
  actions: {
    createItem: function () {

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
