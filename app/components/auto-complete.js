import getItemModelName from 'appkit/utils/model';

export default Ember.Component.extend({
  classNames:  ["wy-tag-input-group"],

  // search results
  results: Ember.A([]),

  showAutocomplete: function () {
    return !this.get('control.meta.isSingle') || (!this.get('control.value.length') && this.get('control.meta.isSingle'));
  }.property('control.value.@each', 'control.meta.isSingle'),

  currentSelection: Ember.arrayComputed('control.value', {
    addedItem: function (array, valueItem, changeMeta) {

      var contentTypeId = valueItem.split(' ')[0];
      var itemId = valueItem.split(' ')[1];

      var component = this;

      this.store.find('contentType', contentTypeId).then(function (contentType) {

        var modelName = getItemModelName(contentType);

        var reverseName = component.get('control.meta.reverseName');
        var reverseIsSingle = contentType.get('controls').findBy('name', reverseName).get('meta.isSingle');

        component.store.find(modelName, itemId).then(function (model) {

          // this feels like a hacky way to get the type and item from the edit controller
          var editController = component.get('parentView.parentView.context');
          var editType = editController.get('type');
          var editItem = editController.get('itemModel');
          var editItemKey = editType.get('id') + ' ' + editItem.get('id');

          var reverseValue = model.get('itemData')[reverseName];

          if (reverseIsSingle && reverseValue && editItemKey !== reverseValue) {

            component.store.find(reverseValue.split(' ')[0], reverseValue.split(' ')[1]).then(function (reverseValueModel) {

              if (window.confirm('The `%@` content type only allows one `%@` to be attached. Do you want to replace `%@` in the current relation with `%@`?'.fmt(contentType.get('name'), editType.get('name'), reverseValueModel.get('itemData.name'), editItem.get('itemData.name')))) {
                array.pushObject(model);
              } else {
                component.get('control.value').removeObject(valueItem);
              }

            });

          } else {
            array.pushObject(model);
          }

        }, function (error) {

          component.get('control.value').removeObject(valueItem);

        });

      });

      return array;
    },
    removedItem: function (array, item) {
      array.removeObject(array.findBy('id', item.split(' ')[1]));
      return array;
    }
  }),

  actions: {
    addToSelection: function (result) {

      if (!result) {
        return;
      }

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
