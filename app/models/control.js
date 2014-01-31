export default DS.Model.extend(Ember.Validations.Mixin, {
  name       : DS.attr('string'),
  label      : DS.attr('string'),
  placeholder: DS.attr('string'),
  help       : DS.attr('string'),
  required   : DS.attr('boolean'),
  controlType: DS.belongsTo('control-type'),
  showInCms  : DS.attr('boolean'),
  locked     : DS.attr('boolean'),
  meta       : DS.belongsTo('meta-data', { embedded: 'always' }),

  setName: function () {
    if (!this.get('locked') && this.get('label')) {
      this.set('name', this.get('label').toLowerCase().replace(/\s+/g, '_').replace(/(\W|[A-Z])/g, ''));
    }
  }.observes('label'),

  validations: {
    type: {
      presence: true
    }
  }
});
