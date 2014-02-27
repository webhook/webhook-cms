export default Ember.Handlebars.makeBoundHelper(function(datetime, options) {
  if (!datetime) {
    return "";
  }
  return moment(datetime).format(options.hash.format || 'LLLL');
});
