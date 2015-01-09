export default Ember.Handlebars.makeBoundHelper(function(string) {
  return new Ember.Handlebars.SafeString(marked(string));
});
