export default Ember.View.extend({
  tagName : "ol",
  classNames: ["wy-form-gallery"],

  didInsertElement : function () {
    this.makeSortable();
  },

  makeSortable: function () {

    var originalindex, self = this;

    var items = this.get('items'),
        images = this.get('images');

    this.$().sortable({
      items      : "> li",
      placeholder: 'wh-form-control-placeholder',
      helper     : 'clone',

      start: function (event, ui) {

        ui.helper.find('.wy-control-group-edit').removeClass('wy-control-group-edit');
        ui.helper.find('.wy-tooltip').remove();

        originalindex = ui.item.parent().children('li').index(ui.item);

      },
      update: function  (event, ui) {

        var newindex = ui.item.parent().children(':not(script)').index(ui.item);

        $(this).sortable('cancel');

        var image = images.objectAt(originalindex);
        var item = items.objectAt(originalindex);

        images.removeAt(originalindex);
        images.insertAt(newindex, image);

        items.removeAt(originalindex);
        items.insertAt(newindex, item);

      }
    });

  }
});
