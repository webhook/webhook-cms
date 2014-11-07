// see http://numeraljs.com/ for formats

/* global numeral */
export default Ember.Handlebars.makeBoundHelper(function(number, options) {
  if (!number) {
    return "";
  }
  if (options.hash.format) {
    return numeral(number).format(options.hash.format);
  } else {
    return numeral(number).format();
  }
});
