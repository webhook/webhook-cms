export default DS.Model.extend(Ember.Validations.Mixin, {
  name       : DS.attr('string'),
  label      : DS.attr('string'),
  placeholder: DS.attr('string'),
  type       : DS.belongsTo('field-type', { embedded: 'always' }),

  validations: {
    name: {
      presence: true
    },
    type: {
      presence: true
    }
  }
});
