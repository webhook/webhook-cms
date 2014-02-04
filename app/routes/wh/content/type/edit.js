import getItemModelName from 'appkit/utils/model';

export default Ember.Route.extend({
  model: function (params) {
    var modelName = getItemModelName(this.modelFor('wh.content.type').get('name'));
    return this.store.find(modelName, params.item_id);
  },
  setupController: function (controller, model) {

    var data = model.get('data'),
        type = this.modelFor('wh.content.type');

    type.get('controls').forEach(function (control) {
      var value = data[control.get('name')];
      if (!value && control.get('controlType.valueType') === 'object') {
        value = {};
      }
      control.set('value', value);
    });

    controller.set('type', type);
    this._super.apply(this, arguments);
  }
});
