import SearchIndex from 'appkit/utils/search-index';

export default Ember.TextField.extend({
  resultsPage: 1,

  searchQueryObserver: Ember.debouncedObserver(function() {

    if (this.get('value')) {

      var parentView = this.get('parentView');

      parentView.set('isLoading', true);

      SearchIndex.search(this.get('value'), this.get('resultsPage'), this.get('filter')).then(function (results) {
        parentView.set('isLoading', false);
        parentView.set('results', Ember.A(results).map(function (result) {
          return Ember.Object.create(result);
        }));
      }, function (error) {
        parentView.set('isLoading', false);
        Ember.Logger.error(error);
      });

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
      if (!Ember.isEmpty(this.get('parentView.results'))) {
        this.get('parentView.controller').send('addToSelection', this.get('parentView.results').findBy('isSelected'));
      } else if (this.get('value') && !this.get('parentView.isLoading')) {

        var itemName = this.get('value');

        if (!window.confirm('Create and add `%@`?'.fmt(itemName))) {
          return;
        }

        var store = this.get('parentView').store;
        var controller = this.get('parentView.controller');
        var type = this.get('filter');

        store.find('content-type', type).then(function (contentType) {
          var newItem = store.createRecord(contentType.get('itemModelName'), {
            itemData: {
              name: itemName
            }
          }).save().then(function (item) {
            controller.send('addToSelection', Ember.Object.create({
              type: type,
              id: item.get('id')
            }));
          });
        });

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
