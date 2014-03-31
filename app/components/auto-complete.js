import getItemModelName from 'appkit/utils/model';

export default Ember.Component.extend({
  classNames:  ["wy-tag-input-group"],

  // search results
  results: Ember.A([]),

  // map models to position in selection
  selectionMap: Ember.A([]),

  currentSelection: Ember.arrayComputed('value', {
    addedItem: function (array, valueItem, changeMeta) {

      var contentTypeId = valueItem.split(' ')[0];
      var itemId = valueItem.split(' ')[1];

      this.get('store').find('contentType', contentTypeId).then(function (contentType) {
        var modelName = getItemModelName(contentType);
        this.get('store').find(modelName, itemId).then(function (model) {
          array.pushObject(model);
          this.get('selectionMap').pushObject(valueItem);
        }.bind(this));
      }.bind(this));

      return array;
    },
    removedItem: function (array, item) {
      var itemIndex = this.get('selectionMap').indexOf(item);
      array.removeAt(itemIndex);
      this.get('selectionMap').removeObject(item);
      return array;
    }
  }),

  actions: {
    addToSelection: function (result) {
      var resultKey = result.type + ' ' + result.id;
      if (this.get('value').indexOf(resultKey) < 0) {
        this.get('value').pushObject(result.type + ' ' + result.id);
      }

      this.get('results').clear();
    },
    removeItem: function (model) {
      this.get('value').removeObject(model.constructor.typeKey + ' ' + model.get('id'));
    }
  }
});
