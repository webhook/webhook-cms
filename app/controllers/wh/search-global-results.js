export default Ember.ArrayController.extend({
  needs: "wh",
  searchQuery: Ember.computed.alias("controllers.wh.searchQuery"),
  isLoading: false,
  isEmpty: false,

  results: [],

  searchQueryObserver: Ember.debouncedObserver(function() {

    if(!this.get('searchQuery')) {
      this.set('isLoading', false);
      this.set('isEmpty', true);

    } else {
      this.set('isEmpty', false);
      this.set('isLoading', true);

      window.ENV.search(this.get('searchQuery'), 1, function(err, data) {
        this.set('results', data);
        this.set('isLoading', false);
      }.bind(this));
    }

  }, 'searchQuery', 1000).on('init'),

});
