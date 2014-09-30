import downcode from 'appkit/utils/downcode';
import MetaWithOptions from 'appkit/utils/meta-options';

export default DS.Model.extend({
  name       : DS.attr('string'),
  label      : DS.attr('string'),
  placeholder: DS.attr('string'),
  help       : DS.attr('string'),
  required   : DS.attr('boolean'),
  controlType: DS.belongsTo('control-type'),
  showInCms  : DS.attr('boolean'),
  locked     : DS.attr('boolean'),
  hidden     : DS.attr('boolean'),
  meta       : DS.attr('json'),

  setName: function () {
    // you cannot change the name of locked controls
    if (!this.get('locked')) {
      var label = this.get('label') || this.get('controlType.name');
      this.set('name', downcode(label).toLowerCase().replace(/\s+/g, '_').replace(/(\W|[A-Z])/g, ''));
    }
  }.observes('label'),

  showPlaceholder: function () {
    return this.get('controlType.widget') !== 'instruction';
  }.property('controlType.widget'),

  showRequired: function () {
    return this.get('controlType.widget') !== 'instruction' && !this.get('locked');
  }.property('controlType.widget'),

  // This is the value that we will store in Firebase
  correctedValue: function () {

    var control = this;

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

    case 'select':
      value = control.getWithDefault('value', '');
      break;

    case 'layout':
      value = control.getWithDefault('value', null);
      break;

    }

    value = typeof value === 'undefined' ? null : value;

    // switch (control.get('controlType.widget')) {
    // case 'checkbox':
    //   Ember.Logger.log('checkbox:%@'.fmt(control.get('name')), value.map(function (option) {
    //     return option.label + ':' + option.value;
    //   }));
    //   break;
    //
    // default:
    //   Ember.Logger.log('%@:%@'.fmt(control.get('controlType.widget'), control.get('name')), value);
    //   break;
    //
    // }

    return value;

  }.property('value')
});
