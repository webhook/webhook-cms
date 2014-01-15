export default DS.Model.extend({
  name: DS.attr('string'),
  fields: DS.hasMany('field-type', { embedded: 'always' })
});
