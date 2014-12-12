import FormbuilderWidgetView from 'appkit/views/formbuilder-widget';

export default Ember.CollectionView.extend({
  tagName             : "ol",
  initialControlsAdded: 0,
  animationLength     : 500,

  content: function () {
    return this.get('model.controls');
  }.property(),

  willInsertElement: function () {
    this.set('initialControlsLength', this.get('content.length'));
  },

  didInsertElement : function () {
    this.makeSortable();
  },

  makeSortable: function () {

    var view = this;
    var controller = this.get('controller');

    var originalIndex;

    this.$().sortable({
      items      : '> li:not(.wy-control-group-hidden, .wy-control-name-name)',
      placeholder: 'wh-form-control-placeholder',
      helper     : 'clone',
      axis       : 'y',

      start: function (event, ui) {

        ui.helper.find('.wy-control-group-edit').removeClass('wy-control-group-edit');
        ui.helper.find('.wy-tooltip').remove();

        originalIndex = ui.item.parent().children('li').index(ui.item);

      },
      update: function  (event, ui) {

        var newIndex = ui.item.parent().children(':not(script)').index(ui.item);

        if (ui.item.hasClass('ui-draggable-dragging')) {

          var type = ui.item.data('id');

          $(this).sortable('cancel');
          ui.item.remove();

          controller.addControlAtIndex(view.get('model'), type, newIndex);

        } else {

          $(this).sortable('cancel');

          controller.updateOrder(view.get('model'), originalIndex, newIndex);

        }

      }
    });

  },

  itemViewClass: FormbuilderWidgetView
});
