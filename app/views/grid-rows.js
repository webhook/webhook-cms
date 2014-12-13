export default Ember.CollectionView.extend({

  content: function () {
    return this.get('gridControl.value');
  }.property(),

  itemViewClass: Ember.View.extend({
    templateName: 'grid-row',

    isActive: function () {
      return this.get('parentView.context.activeRows').indexOf(this.get('rowIndex')) >= 0;
    }.property('parentView.context.activeRows.length', 'rowIndex'),

    rowIndex: function () {
      return this.get('parentView.gridControl.value').indexOf(this.get('content'));
    }.property('parentView.gridControl.value.length'),

    rowIndex1: function () {
      return this.get('rowIndex') + 1;
    }.property('rowIndex')

  })

});
