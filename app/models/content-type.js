export default DS.Model.extend(Ember.Validations.Mixin, {
  name    : DS.attr('string'),
  slug    : DS.attr('string'),
  controls: DS.hasMany('control', { embedded: 'always' }),
  oneOff  : DS.attr('boolean'),

  nameChanged: function () {
    this.set('slug', this.get('name').replace(/\s+|\W/g, ''));
  }.observes('name')
});
