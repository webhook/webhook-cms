export default Ember.View.extend({

  didInsertElement: function () {
    // real dumb way of making sure the content types are there
    this.$().one('mouseenter', this.makeDraggable.bind(this));
  },

  makeDraggable: function () {

    var view = this;

    var sortable;

    // layout and grid control types are not allowed in grid
    switch (view.get('controlType.id')) {
      case 'layout':
      case 'grid':
        sortable = Ember.$('form > fieldset > .ui-sortable');
        break;
      default:
        sortable = Ember.$('form .ui-sortable');
        break;
    }

    this.$().draggable({
      helper: function (event) {

        var helper = $('<div class="wh-form-control-clone">'),
            icon = $('<span>').appendTo(helper);

        helper.width(Ember.$('.wh-content-edit').width());

        helper.data('id', view.get('controlType.id'));

        icon.addClass($(this).find('a').attr('class')).text($(this).text());

        return helper;

      },
      appendTo: 'body',
      connectToSortable: sortable,
      revert: true,
      revertDuration: 0
    });
  }

});
