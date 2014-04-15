export default function dataFromControls (controls) {

  var data = {};

  // gather and clean data for storage
  controls.filterBy('value').forEach(function (control) {

    Ember.Logger.info('Extracting value from ' + control.get('controlType.widget') + ':' + control.get('name'));

    var value = control.get('value');

    // Convert ember arrays to normal arrays so firebase doesn't throw
    // a fit on `_super` and `@each` properties
    if (Ember.isArray(value)) {
      value = value.toArray();
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

      // Help transition to object type for files.
      // Can remove in future.
      case 'image':
      case 'audio':
      case 'file':
        if (value === 'string') {
          value = {};
        }
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

    case 'relation':
      if (control.get('meta.data.isSingle')) {
        if (value.length) {
          value = value.pop();
        } else {
          value = null;
        }
      }
      break;

    }

    data[control.get('name')] = value;

    Ember.Logger.info(control.get('controlType.widget') + ':' + control.get('name') + ' value', value);
  });

  controls.filterBy('controlType.widget', 'select').forEach(function (control) {
    data[control.get('name')] = control.getWithDefault('value', '');
  });

  return data;
}
