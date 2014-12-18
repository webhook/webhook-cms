export default function dataFromControls (controls) {

  var data = {};

  Ember.Logger.log('Extracting data from %@ controls.'.fmt(controls.get('length')));

  // normalize data for storage
  // emberfire uses the update() method when saving so we need to explicitly set every key
  controls.forEach(function (control) {

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
      value = isNaN(parseFloat(value)) ? null : parseFloat(value);
      break;

    // add timezone to datetime values
    case 'datetime':
      value = value ? moment(value).format() : null;
      // add extra data for sorting
      data['_sort_' + control.get('name')] = value ? moment(value).unix() : null;
      break;

    // Make sure we don't try to save `undefined` for checkbox values
    case 'checkbox':
      if (Ember.isArray(value)) {
        value.rejectBy('value').setEach('value', false);
      } else {
        value = [];
      }
      break;

    case 'relation':
      if (control.get('meta.isSingle')) {
        if (Ember.isArray(value)) {
          value = value.get('lastObject');
        } else {
          value = null;
        }
      }
      break;

    case 'grid':
      if (Ember.isArray(value)) {

        value = value.map(function (row) {

          control.get('controls').forEach(function (subControl) {
            subControl.set('value', row.get(subControl.get('name')));
          });

          return dataFromControls(control.get('controls'));
        });

        value = value.filter(function (row) {
          var hasValue = false;
          Ember.$.each(row, function (key, value) {
            hasValue = !Ember.isEmpty(value);
          });
          return hasValue;
        });

      } else {
        value = [];
      }
      break;

    }

    data[control.get('name')] = value;

    // Log values
    Ember.Logger.log(control.get('controlType.widget') + ':' + control.get('name'));

    switch (control.get('controlType.widget')) {
    case 'checkbox':
      Ember.Logger.log(value.map(function (option) {
        return option.label + ':' + option.value;
      }));
      break;

    case 'relation':
      Ember.Logger.log(Ember.isArray(value) ? value.join(', ') : value);
      break;

    case 'embedly':
    case 'image':
    case 'file':
    case 'audio':
      Ember.Logger.log(JSON.stringify(value, null, 2));
      break;

    default:
      Ember.Logger.log(value);
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
