import SearchIndex from 'appkit/utils/search-index';

export default Ember.Route.extend({
  model: function (params) {
    return this.store.find('content-type', params.type_id);
  },

  actions: {
    deleteItem: function (item) {
      if (!window.confirm('Are you sure you want to remove %@?'.fmt(item.get('itemData.name')))) {
        return;
      }

      var route = this;
      var contentType = this.get('context');

      Ember.Logger.log('Attempting to delete `%@:%@`'.fmt(contentType.get('id'), item.get('id')));

      // before we destroy this item, lets remove any reverse relationships pointing to it.

      Ember.Logger.log('Checking for reverse relations to update during item deletion.');

      var relatedKey = contentType.get('id') + ' ' + item.get('id');

      // we need to make sure the relation controlType is in the store so when we filter it happens immediately
      route.store.find('control-type', 'relation').then(function () {

        var relationControls = contentType.get('controls').filterBy('controlType.widget', 'relation');

        Ember.Logger.log('Found %@ relation controls'.fmt(relationControls.get('length')));

        relationControls.forEach(function (control) {

          Ember.Logger.log('Updating reverse relations of `%@`'.fmt(control.get('name')));

          var relatedContentTypeId = control.get('meta.contentTypeId');
          var relatedControlName = control.get('meta.reverseName');
          var relatedItemIds = (item.get('itemData')[control.get('name')] || []).map(function (value) {
            return value.split(' ')[1];
          });

          if (Ember.isEmpty(relatedItemIds)) {
            Ember.Logger.log('`%@` control has no related items to update.'.fmt(control.get('name')));
            return;
          }

          Ember.Logger.log('`%@` control has %@ items in `%@` need to be updated'.fmt(control.get('name'), relatedItemIds.get('length'), relatedContentTypeId));

          // We have to get the contentType to get the itemModel.
          route.store.find('content-type', relatedContentTypeId).then(function (relatedContentType) {

            // loop through all the related items and remove deleted item from relationship
            relatedItemIds.forEach(function (relatedItemId) {
              route.store.find(relatedContentType.get('itemModelName'), relatedItemId).then(function (relatedItem) {
                var itemData = relatedItem.get('itemData');

                if (Ember.isEmpty(itemData[relatedControlName])) {
                  Ember.Logger.warn('No reverse data found at `%@` control!'.fmt(relatedControlName));
                } else {

                  if (Ember.isArray(itemData[relatedControlName])) {
                    itemData[relatedControlName] = Ember.A(itemData[relatedControlName]).removeObject(relatedKey).toArray();
                  } else {
                    itemData[relatedControlName] = null;
                  }

                  Ember.Logger.log('Setting `%@` to %@'.fmt(relatedControlName, itemData[relatedControlName]));

                  relatedItem.set('itemData', itemData);

                  relatedItem.save().then(function () {
                    Ember.Logger.log('`%@:%@` relations updated.'.fmt(relatedContentType.get('itemModelName'), relatedItem.get('id')));
                  });

                }
              });
            });

          });

        });

      });

      // remove from search index
      SearchIndex.deleteItem(item, contentType);

      // remove item from firebase
      return item.destroyRecord().then(function () {
        Ember.Logger.log('Item successfully destroyed.');
        route.send('notify', 'success', 'Item removed!');
        route.send('buildSignal');
        route.transitionTo('wh.content.type', contentType);
      });

    }
  }
});
