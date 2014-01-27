export default DS.Model.extend({
  data       : DS.attr('json'),
  contentType: DS.belongsTo('content-type')
});
