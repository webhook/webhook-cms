import getItemModelName from 'appkit/utils/model';

export default Ember.CollectionView.extend({

  limit: 3,

  content: function () {
    if (!this.get('relationKeys')) {
      return Ember.A([]);
    }
    return this.get('relationKeys').slice(0, this.get('limit'));
  }.property('relationKeys'),

  itemViewClass: Ember.View.extend({
    tagName: 'span',
    willInsertElement: function () {

      if (!this.get('content')) {
        Ember.Logger.error('No relationKey');
        return;
      }

      var relationNameItem = this;
      var collectionView = this.get('parentView');
      var store = this.get('controller.store');

      var content = this.get('content');
      var keyParts = content.split(' ');
      var contentTypeId = keyParts[0];
      var itemId = keyParts[1];

      Ember.Logger.info('Looking up item for relation name', contentTypeId, itemId);

      store.find('contentType', contentTypeId).then(function (contentType) {
        var modelName = getItemModelName(contentType);

        store.find(modelName, itemId).then(function (relation) {
          Ember.Logger.info('Found item for relation', relation.get('data.name'));
          if (content === collectionView.get('content.lastObject')) {
            relationNameItem.set('last', true);
            if (collectionView.get('relationKeys.length') > collectionView.get('limit')) {
              relationNameItem.set('more', collectionView.get('relationKeys.length') - collectionView.get('limit'));
            }
          }
          relationNameItem.set('relation', relation);
        });
      });

    }
  })
});
