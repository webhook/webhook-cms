// This is essentially a hack until you can pass variables to the {{t}} helper.
// See https://github.com/jamesarosen/ember-i18n/issues/131 for updates
export default Ember.Handlebars.makeBoundHelper(function(name, group) {
  if (!name) {
    return '';
  }

  return Ember.I18n.translations['form'][group === true ? 'group' : 'widget'][name.toLowerCase()];
});
