export default DS.Model.extend(Ember.Validations.Mixin, {
  name       : DS.attr('string'),
  label      : DS.attr('string'),
  placeholder: DS.attr('string'),
  help       : DS.attr('string'),
  required   : DS.attr('boolean'),
  fieldType  : DS.belongsTo('field-type', { async: true }),
  showInCms  : DS.attr('boolean'),
  meta       : DS.attr('json', { defaultValue: {} }),

  setName: function () {
    if (this.get('label')) {
      this.set('name', this.get('label').toLowerCase().replace(/\s+/, '_').replace(/(\W|[A-Z])/g, ''));
    }
  }.observes('label'),

  validations: {
    type: {
      presence: true
    }
  }
});
