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

    controller.set('lastUpdated', null);
    controller.set('createDate', null);
    controller.set('showSchedule', false);

    var data = model.get('data'),
        type = this.modelFor('wh.content.type');

    controller.set('publishDate', data.publishDate ? moment(data.publishDate).format('YYYY-MM-DDTHH:mm') : null);
    controller.set('isDraft', data.isDraft || !controller.get('publishDate'));

    type.get('controls').forEach(function (control) {

      control.set('widgetIsValid', true);
      control.set('widgetErrors', Ember.A([]));

      var value = data[control.get('name')];

      if (value && control.get('controlType.widget') === 'checkbox') {
        control.get('meta.data.options').forEach(function (option) {
          option.value = value.findBy('label', option.label).value;
        });
      }

      // remove offset so datetime input can display
      if (value && control.get('controlType.widget') === 'datetime') {

        value = moment(value).format('YYYY-MM-DDTHH:mm');

        // Set `lastUpdated` and `createDate` on controller for Dave.
        if (['last_updated', 'create_date'].indexOf(control.get('name')) >= 0) {
          controller.set(control.get('name').camelize(), value);
        }
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
