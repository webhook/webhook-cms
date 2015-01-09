export default Ember.Handlebars.makeBoundHelper(function(string) {
  if (typeOf string === 'string') {
    return new Ember.Handlebars.SafeString(marked(string));
  } else {
    return '';
  }
});
