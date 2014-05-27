export default Ember.ArrayController.extend({
  needs: ["wh"],
  searchResults: Ember.computed.alias("controllers.wh.searchResults"),
  isLoading: Ember.computed.alias("controllers.wh.searchLoading"),
  debouncedQuery: Ember.computed.alias("controllers.wh.debouncedQuery")
});
