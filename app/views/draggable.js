export default Ember.View.extend({

  didInsertElement : function () {
    this.$().on('mouseenter', function () {
      $(this).find('dd').draggable({
        helper: 'clone',
        appendTo: 'body',
        connectToSortable: Ember.$('form .ui-sortable'),
        revert: true,
        revertDuration: 0,
        stack: $(this).find('dd')
      });
    });
  }

});
