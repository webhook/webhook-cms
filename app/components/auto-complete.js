import getItemModelName from 'appkit/utils/model';

export default Ember.Component.extend({
  classNames:  ["wy-tag-input-group"],

  // search results
  results: Ember.A([]),

  showAutocomplete: function () {
    return !this.get('isSingle') || (!this.get('value.length') && this.get('isSingle'));
  }.property('value.@each', 'isSingle'),

  currentSelection: Ember.arrayComputed('value', {
    addedItem: function (array, valueItem, changeMeta) {

      var contentTypeId = valueItem.split(' ')[0];
      var itemId = valueItem.split(' ')[1];

      this.get('store').find('contentType', contentTypeId).then(function (contentType) {
        var modelName = getItemModelName(contentType);
        this.get('store').find(modelName, itemId).then(function (model) {
          array.pushObject(model);
        }.bind(this));
      }.bind(this));

      return array;
    },
    removedItem: function (array, item) {
      array.removeObject(array.findBy('id', item.split(' ')[1]));
      return array;
    }
  }),

  actions: {
    addToSelection: function (result) {

      var value = this.getWithDefault('value', Ember.A([]));

      var resultKey = result.get('type') + ' ' + result.get('id');
      if (value.indexOf(resultKey) < 0) {
        value.pushObject(resultKey);
        this.set('value', value);
      }

      this.set('autocompleteValue', null);

      this.get('results').clear();
    },

    removeItem: function (model) {
      this.get('value').removeObject(model.constructor.typeKey + ' ' + model.get('id'));
    },

    removeLastSelection: function () {
      if (this.$('.wy-tag.on').length) {
        var onIndex = this.$('.wy-tag').index(this.$('.wy-tag.on'));
        this.get('value').removeAt(onIndex);
      } else {
        this.$('.wy-tag:last-of-type').addClass('on');
      }
    },

    keyDown: function () {
      this.$('.wy-tag').removeClass('on');
    }
  }
});
