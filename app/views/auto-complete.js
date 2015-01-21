import SearchIndex from 'appkit/utils/search-index';

export default Ember.TextField.extend({
  resultsPage: 1,

  searchQueryObserver: Ember.debouncedObserver(function() {

    var query = this.get('value');
    var type = this.get('filter');

    if (Ember.isEmpty(query)) {
      this.getWithDefault('parentView.results', Ember.A([])).clear();
    } else {

      var parentView = this.get('parentView');

      parentView.set('isLoading', true);

      SearchIndex.search(query, this.get('resultsPage'), type).then(function (results) {
        parentView.set('isLoading', false);
        var canCreate = true;
        results = Ember.A(results).map(function (result) {
          if (query.toLowerCase() === Ember.$('<span>').html(result.name).text().toLowerCase()) {
            canCreate = false;
          }
          return Ember.Object.create(result);
        });
        if (canCreate) {
          results.addObject(Ember.Object.create({
            name: 'Create "%@"'.fmt(query),
            value: query,
            createStub: true,
            type: type
          }));
        }
        parentView.set('results', results);
      }, function (error) {
        parentView.set('isLoading', false);
        Ember.Logger.error(error);
      });

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
      if (!Ember.isEmpty(this.get('parentView.results'))) {
        this.get('parentView.controller').send('addToSelection', this.get('parentView.results').findBy('isSelected'));
      }
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
