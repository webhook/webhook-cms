export default function dataFromControls (controls) {

  var data = {};

  // gather and clean data for storage
  controls.filterBy('value').forEach(function (control) {
    var value = control.get('value');

    // hax
    // firebase doesn't like undefined values and for some reason `_super` is
    // being added to arrays in ember with undefined value
    if (Ember.isArray(value)) {
      delete value._super;
    }

    if (control.get('controlType.valueType') === 'object') {
      Ember.$.each(value, function (key, childValue) {
        if (!childValue) {
          delete value[key];
        }
      });
    }

    // add timezone to datetime values
    if (control.get('controlType.widget') === 'datetime') {
      value = moment(value).format();
    }

    data[control.get('name')] = value;
  });

  // checkboxes are special
  controls.filterBy('controlType.widget', 'checkbox').forEach(function (control) {
    data[control.get('name')] = [];
    control.get('meta.data.options').forEach(function (option) {
      data[control.get('name')].push(option);
    });
  });

  return data;
}
