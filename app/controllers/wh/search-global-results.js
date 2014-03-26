export default Ember.ArrayController.extend({
  needs: "wh",
  searchQuery: Ember.computed.alias("controllers.wh.searchQuery"),
  debouncedQuery: '',

  searchQueryObserver: Ember.debouncedObserver(function() {

    if (this.get('searchQuery')) {
      this.set('isLoading', true);
      this.set('debouncedQuery', this.get('searchQuery'));
      window.ENV.search(this.get('searchQuery'), 1, function(err, data) {
        this.set('model', data);
        this.set('isLoading', false);
      }.bind(this));
    }

  }, 'searchQuery', 500).on('init'),

});
