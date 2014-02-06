import getItemModelName from 'appkit/utils/model';

export default Ember.Route.extend({
  model: function (params) {
    var modelName = getItemModelName(this.modelFor('wh.content.type').get('name'));
    return this.store.find(modelName, params.item_id);
  },
  afterModel: function () {
    // need to make sure all the content types are in the store
    // basically a hack
    return this.store.find('control-type');
  },
  setupController: function (controller, model) {

    var data = model.get('data'),
        type = this.modelFor('wh.content.type');

    type.get('controls').forEach(function (control) {
      var value = data[control.get('name')];

      if (control.get('controlType.widget') === 'checkbox') {
        control.get('meta.data.options').forEach(function (option) {
          option.value = value.findBy('name', option.name).value;
        });
      }

      if (!value && control.get('controlType.valueType') === 'object') {
        value = {};
      }

      window.console.log(control.get('meta.data.options'));

      control.set('value', value);
    });

    controller.set('type', type);
    this._super.apply(this, arguments);
  }
});
