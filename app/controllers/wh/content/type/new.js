import getItemModelName from 'appkit/utils/model';

export default Ember.ObjectController.extend({
  actions: {
    createItem: function () {

      var data = {};

      this.get('model.fields').filterBy('value').forEach(function (field) {
        data[field.get('name')] = field.get('value');
      });

      var modelName = getItemModelName(this.get('model.name'));

      this.store.createRecord(modelName, {
        data: data
      }).save().then(function () {
        window.ENV.sendGruntCommand('build');

        this.transitionToRoute('wh.content.type', this.get('model'));
      }.bind(this));

    }
  }
});
