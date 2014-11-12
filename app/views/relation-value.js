export default Ember.View.extend({

  tagName: 'span',

  templateName: 'widgets/value/relation-item',

  willInsertElement: function () {

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
      view.set('relatedItem', store.find(contentType.get('itemModelName'), itemId));
    });

  },

  // values are displayed in a list, comma is true if this is not the last item or if there are more items
  comma: function () {
    if (Ember.isEmpty(this.get('_parentView._parentView.relationKeys'))) {
      return;
    }
    var isLast = this.get('_parentView._parentView.relationKeys.lastObject') === this.get('context');
    return Ember.isEmpty(this.get('_parentView.more')) && isLast ? null : ',';
  }.property('relatedItem.id', 'contentType.id', '_parentView.content.@each', '_parentView.more')

});
