export default Ember.Handlebars.makeBoundHelper(function(src, options) {
  var params = [];
  ['width', 'height', 'grow'].forEach(function (key) {
    if (options.hash[key]) {
      params.push(key + '=' + options.hash[key]);
    }
  });

  params.push('url=' + encodeURIComponent(src));
  params.push('key=' + window.ENV.resizeKey);

  var imageSource = window.ENV.resizeUrl + '?' + params.join('&');
  return new Ember.Handlebars.SafeString('<img src="' +  imageSource + '">');
});

