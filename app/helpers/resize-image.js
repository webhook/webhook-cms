export default Ember.Handlebars.makeBoundHelper(function(src, options) {

  // Only pass in the image url
  if (!src || typeof src !== 'string') {
    return '';
  }

  var params = [];
  ['width', 'height', 'grow'].forEach(function (key) {
    if (options.hash[key]) {
      params.push(key + '=' + options.hash[key]);
    }
  });

  // Relative url
  if(src.indexOf('http://') === -1) {
    src = 'http://' + window.ENV.siteDNS + src;
  }

  params.push('url=' + encodeURIComponent(src));
  params.push('key=' + window.ENV.embedlyKey);

  var imageSource = window.ENV.displayUrl + (options.hash.crop ? 'crop' : 'resize') + '?' + params.join('&');
  return new Ember.Handlebars.SafeString('<img src="' +  imageSource + '">');
});

