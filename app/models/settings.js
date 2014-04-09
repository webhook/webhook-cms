export default DS.Model.extend({
  siteName       : DS.attr('string'),
  siteUrl        : DS.attr('string'),
  siteDescription: DS.attr('string'),
  siteKeywords   : DS.attr('string'),
  analyticsId    : DS.attr('string'),
  siteTwitter    : DS.attr('string'),
  siteFacebook   : DS.attr('string')
});
