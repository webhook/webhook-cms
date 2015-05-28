export default Ember.Handlebars.makeBoundHelper(function(src, options) {

  var params = [];
  ['width', 'height', 'grow'].forEach(function (key) {
    if (options.hash[key]) {
      params.push(key + '=' + options.hash[key]);
    }
  });

  var imageSource = '';
  var safeImageSource = '';

  // New image format
  if (typeof src === 'object' && src.resize_url) {
    imageSource = src.resize_url;

    imageSource = imageSource + '=s' + (options.hash.size || 100);

    if (options.hash.crop) {
      imageSource = imageSource + '-c';
    }

    safeImageSource = Ember.Handlebars.Utils.escapeExpression(imageSource);

    return new Ember.Handlebars.SafeString('<img src="' + safeImageSource + '">');

  // Old image format
  } else if (typeof src === 'string') {

    // Relative url
    if (src.indexOf('http://') === -1) {
      src = 'http://' + window.ENV.siteDNS + src;
    }

    params.push('url=' + encodeURIComponent(src));
    params.push('key=' + window.ENV.embedlyKey);

    imageSource = window.ENV.displayUrl + (options.hash.crop ? 'crop' : 'resize') + '?' + params.join('&');
    safeImageSource = Ember.Handlebars.Utils.escapeExpression(imageSource);

    return new Ember.Handlebars.SafeString('<img src="' + safeImageSource + '">');
  } else {
    return '';
  }

});
