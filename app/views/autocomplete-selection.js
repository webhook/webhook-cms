export default Ember.CollectionView.extend({
  tagName: 'ol',

  // content: function () {
  //   return this.get('control.value');
  // }.property('control.value'),

  content: Ember.arrayComputed('control.value', {
    addedItem: function (array, valueItem, changeMeta) {

      var insertPosition = this.get('control.value').indexOf(valueItem);

      var contentTypeId = valueItem.split(' ')[0];
      var itemId = valueItem.split(' ')[1];

      var component = this;
      var store = this.get('control.store');

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
    return this.get('control.value.length') > 2;
  }.property('control.value.length'),

  // didInsertElement: function () {
  //   window.console.log(this.get('control.store'));
  // },

  itemViewClass: Ember.View.extend({

  })
});
