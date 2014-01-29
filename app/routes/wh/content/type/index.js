import getItemModelName from 'appkit/utils/model';

export default Ember.Route.extend({
  model: function () {
    var modelName = getItemModelName(this.modelFor('wh.content.type').get('name'));
    return this.store.find(modelName);
  },
  setupController: function (controller, model) {

    var type = this.modelFor('wh.content.type');

    var cmsFieldNames = Ember.A([]);

    type.get('fields').filterBy('showInCms').forEach(function (field) {
      cmsFieldNames.pushObject(field.get('name'));
    });

    model.forEach(function (item) {
      var fieldValues = [];
      cmsFieldNames.forEach(function (name) {
        fieldValues.push(item.get('data')[name]);
      });
      item.set('fields', fieldValues);
    });

    controller.set('contentType', type);
    this._super.apply(this, arguments);
  }
});
