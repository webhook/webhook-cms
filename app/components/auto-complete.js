export default Ember.Component.extend({

  classNames: ['wy-tag-input-group'],

  classNameBindings: [
    'isMany:wy-tag-input-group-many'
  ],

  willInsertElement: function () {
    this.set('initialValue', Ember.copy(this.get('control.value')));
  },

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

      // the store can take a while to get back us so make sure we have a placeholder
      array.pushObject(Ember.Object.create({
        id: itemId,
        name: '...'
      }));

      var component = this;
      var store = component.store;

      store.find('contentType', contentTypeId).then(function (contentType) {

        var reverseName = component.get('control.meta.reverseName');
        var reverseIsSingle = reverseName && contentType.get('controls').findBy('name', reverseName).get('meta.isSingle');

        store.find(contentType.get('itemModelName'), itemId).then(function (model) {

          // Dave wants a class added and then removed when you add an item
          if (component.getWithDefault('initialValue', Ember.A([])).indexOf(valueItem) < 0) {

            model.set('justAdded', true);

            Ember.run.later(function () {
              model.set('justAdded', false);
            }, 500);

          }

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
                array.removeAt(insertPosition);
                array.insertAt(insertPosition, model);
              } else {
                component.get('control.value').removeObject(valueItem);
              }

            });

          } else {
            array.removeAt(insertPosition);
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

  isMany: function () {
    return this.get('currentSelection.length') > 5;
  }.property('currentSelection.length'),

  isFew: function () {
    return !this.get('isMany');
  }.property('isMany'),

  actions: {
    addToSelection: function (result) {

      if (!result) {
        return;
      }

      Ember.Logger.log('Adding `%@` to `%@`'.fmt(Ember.$('<span>').html(result.get('name')).text(), this.get('control.name')));

      var value = this.getWithDefault('control.value', Ember.A([]));

      if (Ember.isEmpty(result.get('createStub'))) {

        var resultKey = result.get('type') + ' ' + result.get('id');

        if (value.indexOf(resultKey) < 0) {
          value.pushObject(resultKey);
          this.set('control.value', value);
        }

      } else {

        var itemName = result.get('value');

        if (!window.confirm('Create and add `%@`? It will be added as a stub.'.fmt(itemName))) {
          return;
        }

        var component = this;
        var store = this.store;
        var type = result.get('type');

        store.find('content-type', type).then(function (contentType) {
          var newItem = store.createRecord(contentType.get('itemModelName'), {
            itemData: {
              name: itemName
            }
          }).save().then(function (item) {
            value.pushObject(type + ' ' + item.get('id'));
            component.set('control.value', value);
          });
        });

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
