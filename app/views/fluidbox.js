export default Ember.View.extend({
  tagName: 'a',
  attributeBindings: ['href'],
  href: function () {
    var dim = Math.max($(window).height(), $(window).width()),
        url = this.get('image.resize_url');
    if (url.indexOf('http://static-cdn.jtvnw.net') === 0) {
      var parts = url.split('.'),
          ext = parts.length > 1 ? ('.' + parts.pop()) : '';

      return parts.join('.') + '-' + dim  + 'x' + dim + '-a' + ext;
    } else {
      return  url + '=s' + dim;
    }
  }.property(),
  didInsertElement: function () {
    this.$().fluidbox({
      stackIndex: 301
    });
  }
});
