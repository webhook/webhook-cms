export default Ember.Handlebars.makeBoundHelper(function(src, options) {

  var params = [];
  ['width', 'height', 'grow'].forEach(function (key) {
    if (options.hash[key]) {
      params.push(key + '=' + options.hash[key]);
    }
  });

  var imageSource = '';

  // New image format
  if (typeof src === 'object') {
    imageSource = src.resize_url;

    imageSource = imageSource + '=s' + (options.hash.size || 100);

    if (options.hash.crop) {
      imageSource = imageSource + '-c';
    }

    return new Ember.Handlebars.SafeString('<img src="' + imageSource + '">');

  // Old image format
  } else if (typeof src === 'string') {

    // Relative url
    if (src.indexOf('http://') === -1) {
      src = 'http://' + window.ENV.siteDNS + src;
    }

    params.push('url=' + encodeURIComponent(src));
    params.push('key=' + window.ENV.embedlyKey);

    imageSource = window.ENV.displayUrl + (options.hash.crop ? 'crop' : 'resize') + '?' + params.join('&');

    return new Ember.Handlebars.SafeString('<img src="' + imageSource + '">');
  } else {
    return '';
  }

});
