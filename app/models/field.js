export default DS.Model.extend({
  name       : DS.attr('string'),
  label      : DS.attr('string'),
  placeholder: DS.attr('string'),
  type       : DS.belongsTo('field-type', { embedded: 'always' })
});
