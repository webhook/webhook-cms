export default Ember.TextField.extend({
  resultsPage: 1,

  searchQueryObserver: Ember.debouncedObserver(function() {

    if (this.get('value')) {
      this.set('parentView.isLoading', true);
      window.ENV.search(this.get('value'), this.get('resultsPage'), this.get('filter'), function (err, data) {
        this.set('parentView.results', Ember.A(data).map(function (result) {
          return Ember.Object.create(result);
        }));
        this.set('parentView.isLoading', false);
      }.bind(this));
    } else {
      this.getWithDefault('parentView.results', Ember.A([])).clear();
    }

  }, 'value', 500).on('init'),

  keyDown: function (event) {

    var currentObject, indexObject;

    switch (event.keyCode) {
    case 8: // delete
      if (!this.get('value')) {
        this.get('parentView.controller').send('removeLastSelection');
      }
      break;

    case 13: // enter
      event.preventDefault();
      this.get('parentView.controller').send('addToSelection', this.get('parentView.results').findBy('isSelected'));
      break;

    case 38: // up
      event.preventDefault();
      currentObject = this.get('parentView.results').findBy('isSelected');
      if (currentObject) {
        indexObject = this.get('parentView.results').indexOf(currentObject);
        if (indexObject > 0) {
          currentObject.set('isSelected', false);
          this.get('parentView.results').objectAt(indexObject - 1).set('isSelected', true);
        }
      }
      break;

    case 40: // down
      event.preventDefault();
      currentObject = this.get('parentView.results').findBy('isSelected');
      if (currentObject) {
        indexObject = this.get('parentView.results').indexOf(currentObject);
        if (indexObject + 1 < this.get('parentView.results.length')) {
          currentObject.set('isSelected', false);
          this.get('parentView.results').objectAt(indexObject + 1).set('isSelected', true);
        }
      }
      break;

    default:
      this.get('parentView.controller').send('keyDown');
      break;

    }

  }
});
