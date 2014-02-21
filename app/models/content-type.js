export default DS.Model.extend({
  name    : DS.attr('string'),
  controls: DS.hasMany('control', { embedded: 'always' }),
  oneOff  : DS.attr('boolean')
});
