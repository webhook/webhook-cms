import getItemModelName from 'appkit/utils/model';

export default Ember.Route.extend({
  beforeModel: function () {
    // need to make sure all the content types are in the store
    // basically a hack
    return this.store.find('control-type');
  },
  model: function (params) {
    var modelName = getItemModelName(this.modelFor('wh.content.type'));
    return this.store.find(modelName, params.item_id);
  },
  setupController: function (controller, model) {

    var data = model.get('data'),
        type = this.modelFor('wh.content.type');

    type.get('controls').forEach(function (control) {
      var value = data[control.get('name')];

      if (value && control.get('controlType.widget') === 'checkbox') {
        control.get('meta.data.options').forEach(function (option) {
          option.value = value.findBy('label', option.label).value;
        });
      }

      if (!value && control.get('controlType.valueType') === 'object') {
        value = {};
      }

      control.set('value', value);
    });

    controller.set('type', type);
    this._super.apply(this, arguments);
  }
});
