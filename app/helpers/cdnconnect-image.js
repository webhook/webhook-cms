export default Ember.Handlebars.makeBoundHelper(function(src, options) {
  var params = [];
  ['width', 'w', 'height', 'h', 'maxwidth', 'maxheight', 'thumbnail', 'thm'].forEach(function (key) {
    if (options.hash[key]) {
      params.push(key + '=' + options.hash[key]);
    }
  });
  return new Ember.Handlebars.SafeString('<img src="' + src + '?' + params.join('&') + '">');
});

