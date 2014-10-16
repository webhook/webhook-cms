import getItemModelName from 'appkit/utils/model';

export default Ember.View.extend({

  tagName: 'span',

  templateName: 'widgets/value/relation-item',

  willInsertElement: function () {

    window.console.log();

    var view = this;
    var store = this.get('controller').store;

    var context = this.get('context');

    if (Ember.isEmpty(context)) {
      return;
    }

    var keyParts = context.split(' ');
    var contentTypeId = keyParts[0];
    var itemId = keyParts[1];

    return store.find('contentType', contentTypeId).then(function (contentType) {
      view.set('contentType', contentType);
      view.set('relatedItem', store.find(getItemModelName(contentType), itemId));
    });

  },

  comma: function () {
    return (Ember.empty(this.get('_parentView.more')) && this.get('_parentView._parentView.relationKeys.lastObject') === this.get('context')) ? null : ',';
  }.property('relatedItem.id', 'contentType.id', '_parentView.content.@each', '_parentView.more')

});
