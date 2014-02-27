import getItemModelName from 'appkit/utils/model';

export default Ember.Route.extend({
  beforeModel: function () {
    // return this.store.find('control-type');
    return Ember.RSVP.Promise.all([
      // need to make sure all the content types are in the store
      // basically a hack
      this.store.find('control-type'),
      // make sure `create_date`, `last_updated` and `publish_date` controls exist
      this.fixControlType(this.modelFor('wh.content.type'))
    ]);
  },
  model: function (params) {
    var modelName = getItemModelName(this.modelFor('wh.content.type'));
    return this.store.find(modelName, params.item_id);
  },
  afterModel: function (model) {
    // Make sure item has `create_date` value
    return this.fixItem(model);
  },
  setupController: function (controller, model) {

    controller.set('showSchedule', false);

    var data = model.get('data'),
        type = this.modelFor('wh.content.type');

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
      }

      if (!value && control.get('controlType.valueType') === 'object') {
        value = {};
      }

      control.set('value', value);
    });

    controller.set('publishDate', type.get('controls').findBy('name', 'publish_date').get('value'));
    controller.set('isDraft', data.isDraft || !controller.get('publishDate'));

    controller.set('lastUpdated', type.get('controls').findBy('name', 'last_updated').get('value'));
    controller.set('createDate', type.get('controls').findBy('name', 'create_date').get('value'));

    controller.set('type', type);
    this._super.apply(this, arguments);
  },

  fixControlType: function (contentType) {

    return this.store.find('control-type', 'datetime').then(function (controlType) {

      var datetimeDefaults = {
        controlType: controlType,
        locked     : true,
        showInCms  : true,
        required   : true,
        hidden     : true
      };

      var controls = contentType.get('controls');

      var addControl = function (data) {
        controls.pushObject(this.store.createRecord('control', Ember.$.extend({}, datetimeDefaults, data)));
      };

      if (!controls.isAny('name', 'create_date')) {
        addControl({
          name : 'create_date',
          label: 'Create Date'
        });
      }

      if (!controls.isAny('name', 'last_updated')) {
        addControl({
          name : 'last_updated',
          label: 'Last Updated'
        });
      }

      if (!controls.isAny('name', 'publish_date')) {
        addControl({
          name : 'publish_date',
          label: 'Publish Date',
          required: false
        });
      }

      contentType.save();

    }.bind(this));

  },
  fixItem: function (item) {
    if (!item.get('data').create_date) {
      item.get('data').create_date = moment().format('YYYY-MM-DDTHH:mm');
    }
  }
});
