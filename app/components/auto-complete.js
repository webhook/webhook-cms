import getItemModelName from 'appkit/utils/model';

export default Ember.Component.extend({
  classNames:  ["wy-tag-input-group"],

  // search results
  results: Ember.A([]),

  showAutocomplete: function () {
    return !this.get('control.meta.data.isSingle') || (!this.get('control.value.length') && this.get('control.meta.data.isSingle'));
  }.property('control.value.@each', 'control.meta.data.isSingle'),

  currentSelection: Ember.arrayComputed('control.value', {
    addedItem: function (array, valueItem, changeMeta) {

      var contentTypeId = valueItem.split(' ')[0];
      var itemId = valueItem.split(' ')[1];

      this.get('targetObject.store').find('contentType', contentTypeId).then(function (contentType) {
        var modelName = getItemModelName(contentType);
        this.get('targetObject.store').find(modelName, itemId).then(function (model) {
          array.pushObject(model);
        }.bind(this), function (error) {
          this.get('control.value').removeObject(valueItem);
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

      var value = this.getWithDefault('control.value', Ember.A([]));

      var resultKey = result.get('type') + ' ' + result.get('id');
      if (value.indexOf(resultKey) < 0) {
        value.pushObject(resultKey);
        this.set('control.value', value);
      }

      this.set('autocompleteValue', null);

      this.get('results').clear();
    },

    removeItem: function (model) {

      // if typeKey is `data`, contentType is oneoff.
      if (model.constructor.typeKey === 'data') {
        this.get('control.value').removeObject(model.get('id') + ' ' + model.get('id'));
      } else {
        this.get('control.value').removeObject(model.constructor.typeKey + ' ' + model.get('id'));
      }

    },

    removeLastSelection: function () {
      if (this.$('.wy-tag.on').length) {
        var onIndex = this.$('.wy-tag').index(this.$('.wy-tag.on'));
        this.get('control.value').removeAt(onIndex);
      } else {
        this.$('.wy-tag:last-of-type').addClass('on');
      }
    },

    keyDown: function () {
      this.$('.wy-tag').removeClass('on');
    }
  }
});
