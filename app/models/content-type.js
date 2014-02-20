export default DS.Model.extend(Ember.Validations.Mixin, {
  name    : DS.attr('string'),
  controls: DS.hasMany('control', { embedded: 'always' }),
  oneOff  : DS.attr('boolean')
});
