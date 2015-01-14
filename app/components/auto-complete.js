export default Ember.Component.extend({

  // search results
  results: Ember.A([]),

  showAutocomplete: function () {

    if (this.get('control.disabled')) {
      return false;
    }

    var permissions = this.get('session.user.permissions');
    var relatedTypeId = this.get('control.meta.contentTypeId');

    if (permissions && (permissions.get(relatedTypeId) === 'none' || permissions.get(relatedTypeId) === 'view')) {
      return false;
    }

    return !this.get('control.meta.isSingle') || (!this.get('control.value.length') && this.get('control.meta.isSingle'));

  }.property('control.value.@each', 'control.meta.isSingle', 'control.disabled'),

  currentSelection: Ember.arrayComputed('control.value', {
    addedItem: function (array, valueItem, changeMeta) {

      var insertPosition = this.get('control.value').indexOf(valueItem);

      var contentTypeId = valueItem.split(' ')[0];
      var itemId = valueItem.split(' ')[1];

      var component = this;
      var store = component.store;

      store.find('contentType', contentTypeId).then(function (contentType) {

        var reverseName = component.get('control.meta.reverseName');
        var reverseIsSingle = reverseName && contentType.get('controls').findBy('name', reverseName).get('meta.isSingle');

        store.find(contentType.get('itemModelName'), itemId).then(function (model) {

          // this feels like a hacky way to get the type and item from the edit controller
          var editController = component.get('parentView.parentView.context');
          var editType = editController.get('type');
          var editItem = editController.get('itemModel');
          var editItemKey = null;

          if (!Ember.isEmpty(editItem)) {
            editItemKey = editType.get('id') + ' ' + editItem.get('id');
          }

          var reverseValue = model.get('itemData')[reverseName];

          if (reverseIsSingle && reverseValue && editItemKey !== reverseValue) {

            store.find(reverseValue.split(' ')[0], reverseValue.split(' ')[1]).then(function (reverseValueModel) {

              if (window.confirm('The `%@` content type only allows one `%@` to be attached. Do you want to replace `%@` in the current relation with `%@`?'.fmt(contentType.get('name'), editType.get('name'), reverseValueModel.get('itemData.name'), editController.get('controls').findBy('name', 'name').get('value') || 'unnamed item'))) {
                array.insertAt(insertPosition, model);
              } else {
                component.get('control.value').removeObject(valueItem);
              }

            });

          } else {
            array.insertAt(insertPosition, model);
          }

        }, function (error) {

          component.get('control.value').removeObject(valueItem);

        });

      });

      return array;
    },
    removedItem: function (array, item) {
      return array.removeObject(array.findBy('id', item.split(' ')[1]));
    }
  }),

  isCrowded: function () {
    return this.get('currentSelection.length') > 2;
  }.property('currentSelection.length'),

  didInsertElement: function () {

    if (this.get('control.disabled')) {
      return;
    }

    var component = this;
    var originalIndex;

    this.$('.current-selection').sortable({
      items: '.wy-tag',
      helper: 'clone',
      start: function (event, ui) {

        originalIndex = ui.item.parent().children('.wy-tag').index(ui.item);

      },
      stop: function (event, ui) {

        var newIndex = ui.item.parent().children('.wy-tag').index(ui.item);

        $(this).sortable('cancel');

        var array = component.get('control.value');
        var relation = array.objectAt(originalIndex);
        array.removeAt(originalIndex);
        array.insertAt(newIndex, relation);
      }
    });

  },

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
