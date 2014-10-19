export default Ember.View.extend({

  didInsertElement : function () {
    // real dumb way of making sure the content types are there
    this.$().one('mouseenter', this.makeDraggable.bind(this));
  },

  makeDraggable: function () {
    this.$('dd').draggable({
      helper: function (event) {

        var helper = $('<div class="wh-form-control-clone">'),
            icon = $('<span>').appendTo(helper);

        helper.data('id', $(this).data('id'));

        icon.addClass($(this).find('a').attr('class')).text($(this).text());

        return helper;

      },
      appendTo: 'body',
      connectToSortable: Ember.$('form .ui-sortable'),
      revert: true,
      revertDuration: 0
    });
  }

});
