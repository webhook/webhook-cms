import getItemModelName from 'appkit/utils/model';

export default Ember.View.extend({

  tagName: 'span',

  willInsertElement: function () {

    var view = this;
    var store = this.get('controller').store;

    var keyParts = this.get('context').split(' ');
    var contentTypeId = keyParts[0];
    var itemId = keyParts[1];

    return store.find('contentType', contentTypeId).then(function (contentType) {
      view.set('contentType', contentType);
      view.set('relatedItem', store.find(getItemModelName(contentType), itemId));
    });

  }

});
