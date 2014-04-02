export default Ember.TextField.extend({
  debouncedQuery: '',
  resultsPage: 1,

  searchQueryObserver: Ember.debouncedObserver(function() {

    if (this.get('value')) {
      this.set('parentView.isLoading', true);
      this.set('debouncedQuery', this.get('value'));
      window.ENV.search(this.get('value'), this.get('resultsPage'), this.get('filter'), function (err, data) {
        this.set('parentView.results', data);
        this.set('parentView.isLoading', false);
      }.bind(this));
    } else {
      this.get('parentView.results').clear();
    }

  }, 'value', 500).on('init'),
});
