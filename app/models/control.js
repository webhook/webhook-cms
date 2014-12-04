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
    return this.get('controlType.widget') !== 'instruction';
  }.property('controlType.widget'),

  showRequired: function () {
    return this.get('controlType.widget') !== 'instruction' && !this.get('locked');
  }.property('controlType.widget'),

  widgetIsValid: true,
  widgetErrors: Ember.A([])

});
