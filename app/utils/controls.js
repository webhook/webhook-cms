export default function dataFromControls (controls) {

  var data = {};

  // gather and clean data for storage
  controls.filterBy('value').forEach(function (control) {

    Ember.Logger.info('Extracting value from ' + control.get('controlType.widget') + ':' + control.get('name'));

    var value = control.get('value');

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

    // force numbers to be numbers
    case 'number':
      value = parseFloat(value);
      break;

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
      if (control.get('meta.isSingle')) {
        if (value.length) {
          value = value.pop();
        } else {
          value = null;
        }
      }
      break;

    }

    data[control.get('name')] = value;

    switch (control.get('controlType.widget')) {
    case 'checkbox':
      Ember.Logger.info('checkbox:' + control.get('name') + ' value', value.map(function (option) {
        return option.label + ':' + option.value;
      }));
      break;

    default:
      Ember.Logger.info(control.get('controlType.widget') + ':' + control.get('name') + ' value', value);
      break;
    }

  });

  controls.filterBy('controlType.widget', 'select').forEach(function (control) {
    data[control.get('name')] = control.getWithDefault('value', '');
  });

  controls.filterBy('controlType.widget', 'layout').forEach(function (control) {
    data[control.get('name')] = control.getWithDefault('value', null);
  });

  return data;
}
