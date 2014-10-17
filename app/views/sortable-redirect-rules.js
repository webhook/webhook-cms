export default Ember.CollectionView.extend({
  tagName: 'tbody',

  didInsertElement: function () {

    var originalIndex;
    var controller = this.get('controller');

    this.$().sortable({
      helper: 'clone',
      axis: 'y',
      start: function (event, ui) {
        originalIndex = ui.item.parent().children('tr').index(ui.item);
      },
      update: function (event, ui) {

        var newIndex = ui.item.parent().children('tr').index(ui.item);

        $(this).sortable('cancel');

        controller.moveRule(originalIndex, newIndex);

      }
    });

  },

  itemViewClass: Ember.View.extend({
    templateName: 'wh/settings/urls-rule'
  })
});
