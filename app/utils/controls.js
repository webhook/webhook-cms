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

      switch (control.get('controlType.widget')) {
      case 'tabular':
        var convertedValue = Ember.A([]);
        value.forEach(function (row) {
          convertedValue.push(row.map(function (cell) {
            return cell.value || "";
          }));
        });
        value = convertedValue;
        break;

      default:
        Ember.$.each(value, function (key, childValue) {
          if (!childValue) {
            delete value[key];
          }
        });
        break;
      }

    }

    switch (control.get('controlType.widget')) {
    // add timezone to datetime values
    case 'datetime':
      value = moment(value).format();
      // add extra data for sorting
      data['_sort_' + control.get('name')] = moment(value).unix();
      break;

    // Make sure we don't try to save `undefined` for checkbox values
    case 'checkbox':
      value.rejectBy('value').setEach('value', false);
      break;
    }

    data[control.get('name')] = value;
  });

  controls.filterBy('controlType.widget', 'select').forEach(function (control) {
    data[control.get('name')] = control.getWithDefault('value', '');
  });

  return data;
}
