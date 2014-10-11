import getItemModelName from 'appkit/utils/model';

export default Ember.CollectionView.extend({

  limit: 3,

  content: function () {
    if (!this.get('relationKeys')) {
      return Ember.A([]);
    }
    if (typeof this.get('relationKeys') === 'string') {
      return Ember.A([this.get('relationKeys')]);
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

      store.find('contentType', contentTypeId).then(function (contentType) {
        var modelName = getItemModelName(contentType);

        store.find(modelName, itemId).then(function (relation) {
          if (content === collectionView.get('content.lastObject')) {
            relationNameItem.set('last', true);
            if (collectionView.get('content.length') > collectionView.get('limit')) {
              relationNameItem.set('more', collectionView.get('content.length') - collectionView.get('limit'));
            }
          }
          relationNameItem.set('relation', relation);
        });
      });

    }
  })
});
