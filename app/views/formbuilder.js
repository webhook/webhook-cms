import FormbuilderWidgetView from 'appkit/views/formbuilder-widget';

export default Ember.CollectionView.extend({
  tagName             : "ol",
  initialControlsAdded: 0,
  animationLength     : 500,

  willInsertElement: function () {
    this.set('initialControlsLength', this.get('content.length'));
  },

  didInsertElement : function () {
    this.makeSortable();
  },

  makeSortable: function () {

    var controller = this.get('controller');

    var originalindex;

    this.$().sortable({
      items      : '> li:not(.wy-control-group-hidden, .wy-control-name-name)',
      placeholder: 'wh-form-control-placeholder',
      helper     : 'clone',
      axis       : 'y',

      start: function (event, ui) {

        ui.helper.find('.wy-control-group-edit').removeClass('wy-control-group-edit');
        ui.helper.find('.wy-tooltip').remove();

        originalindex = ui.item.parent().children('li').index(ui.item);

      },
      update: function  (event, ui) {

        var newindex = ui.item.parent().children(':not(script)').index(ui.item);

        if (ui.item.hasClass('ui-draggable')) {

          var type = ui.item.data('id');

          $(this).sortable('cancel');
          ui.item.remove();

          controller.addControlAtIndex(type, newindex);

        } else {

          $(this).sortable('cancel');

          controller.updateOrder(originalindex, newindex);

        }

      }
    });

  },

  itemViewClass: FormbuilderWidgetView
});
