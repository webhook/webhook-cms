export default Ember.View.extend({
  tagName : "ol",
  classNames: ["wy-form-gallery"],

  didInsertElement : function () {
    this.makeSortable();
  },

  makeSortable: function () {

    var originalindex, self = this;

    this.$().sortable({
      items      : "> li",
      placeholder: 'wh-form-gallery-placeholder',
      helper     : 'clone',

      start: function (event, ui) {

        ui.helper.find('.wy-control-group-edit').removeClass('wy-control-group-edit');
        ui.helper.find('.wy-tooltip').remove();

        originalindex = ui.item.parent().children('li').index(ui.item);

      },
      update: function  (event, ui) {

        var items  = this.get('items'),
            images = this.get('images');

        var newindex = ui.item.parent().children(':not(script)').index(ui.item);

        self.$().sortable('cancel');

        var image = images.objectAt(originalindex);
        images.removeAt(originalindex);
        images.insertAt(newindex, image);

        var item = items.objectAt(originalindex);
        items.removeAt(originalindex);
        items.insertAt(newindex, item);

      }.bind(this)
    });

  }
});
