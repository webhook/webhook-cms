import SearchIndex from 'appkit/utils/search-index';

export default DS.Model.extend({
  itemData: DS.attr('json'),

  updateSearchIndex: function () {
    SearchIndex.indexItem(this);
  }.on('didUpdate', 'didCreate'),

  deleteSearchIndex: function () {
    SearchIndex.deleteItem(this);
  }.on('didDelete')
});
