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

  // grid controls can have embedded sub controls
  controls: DS.hasMany('control', { embedded: true, inverse: null }),

  setName: function () {
    // you cannot change the name of locked controls
    if (!this.get('locked')) {
      var label = this.get('label') || this.get('controlType.name');
      this.set('name', downcode(label).toLowerCase().replace(/\s+/g, '_').replace(/(\W|[A-Z])/g, ''));
    }
  }.observes('label'),

  showPlaceholder: function () {

    var widget = this.get('controlType.widget');

    if (widget === 'instruction') {
      return false;
    }

    if (widget === 'boolean') {
      return false;
    }

    return true;

  }.property('controlType.widget'),

  showRequired: function () {

    if (this.get('locked')) {
      return false;
    }

    var widget = this.get('controlType.widget');

    if (widget === 'instruction') {
      return false;
    }

    if (widget === 'boolean') {
      return false;
    }

    return true;

  }.property('controlType.widget', 'locked'),

  widgetIsValid: true,
  widgetErrors: Ember.A([]),

  setValue: function (value) {

    var control = this,
        widget = control.get('controlType.widget');

    control.set('widgetErrors', Ember.A([]));

    if (widget === 'checkbox') {
      control.get('meta.options').forEach(function (option) {
        if (value && value.findBy('label', option.label)) {
          option.value = value.findBy('label', option.label).value;
        }
      });
    }

    if (widget === 'boolean') {
      if (Ember.isEmpty(value)) {
        value = this.getWithDefault('meta.defaultValue', false);
      } else {
        value = !!value;
      }
    }

    if (['image', 'audio', 'file'].indexOf(widget) >= 0) {
      value = Ember.Object.create(value || {});
    }

    // remove offset so datetime input can display
    if (value && widget === 'datetime') {
      value = moment(value).format('YYYY-MM-DDTHH:mm');
    }

    if (widget === 'tabular') {
      if (Ember.isEmpty(value)) {
        value = Ember.A([]);
        var emptyRow = Ember.A([]);
        control.get('meta.options').forEach(function () {
          emptyRow.pushObject(Ember.Object.create());
        });
        value.pushObject(emptyRow);
      } else {
        // we must convert data into mutable form
        var mutableValue = Ember.A([]);
        value.forEach(function (row) {
          var mutableData = Ember.A([]);
          row.forEach(function (data) {
            mutableData.pushObject({
              value: data
            });
          });
          mutableValue.pushObject(mutableData);
        });
        value = mutableValue;
      }
    }

    if (widget === 'relation' && value && !Ember.isArray(value)) {
      value = Ember.A([value]);
    }

    if (widget === 'grid') {

      if (Ember.isEmpty(value) || !Ember.isArray(value)) {
        value = [{}].map(control.setGridValues, control);
        control.set('isPlaceholder', true);
      } else {
        control.set('isPlaceholder', false);
        value = value.map(control.setGridValues, control);
      }

    }

    if (Ember.isEmpty(value) && control.get('controlType.valueType') === 'object') {
      value = {};
    }

    control.set('value', value);
  },

  setGridValues: function (values) {
    var rowValue = Ember.Object.create({});
    this.get('controls').forEach(function (control) {
      control.setValue(values[control.get('name')]);
      rowValue.set(control.get('name'), control.get('value'));
    });
    return rowValue;
  }

});
