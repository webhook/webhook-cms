export default DS.Model.extend({
  data     : DS.attr('string'),
  createdAt: DS.attr('string', {
    defaultValue: function() {
      return new Date();
    }
  })
});
