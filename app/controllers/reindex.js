export default Ember.ArrayController.extend({
  sortProperties: ['name'],

  isIndexing: function () {
    return !this.get('model').isEvery('indexingClass', 'complete');
  }.property('model.@each.isIndexing'),

  handleBeforeUnload: function () {
    return 'We are not done reindexing your content. If you leave now, content will be missing from the search index.';
  },

  watchForUnload: function () {
    if (this.get('isIndexing')) {
      Ember.$(window).one('beforeunload', this.handleBeforeUnload);
    } else {
      Ember.$(window).off('beforeunload', this.handleBeforeUnload);
    }
  }.observes('isIndexing')

});
