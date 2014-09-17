export default Ember.Controller.extend({
  needs: ["wh"],
  searchResults: Ember.computed.alias("controllers.wh.searchResults"),
  isLoading: Ember.computed.alias("controllers.wh.searchLoading"),
  debouncedQuery: Ember.computed.alias("controllers.wh.debouncedQuery")
});
