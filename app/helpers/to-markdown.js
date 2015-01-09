export default Ember.Handlebars.makeBoundHelper(function(string) {
  if (typeof string === 'string') {
    return new Ember.Handlebars.SafeString(marked(string));
  } else {
    return '';
  }
});
