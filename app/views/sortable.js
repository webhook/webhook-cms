export default Ember.CollectionView.extend({
  tagName : "ol",

  didInsertElement : function () {
    if (!this.get('disabled')) {
      this.makeSortable();
    }
  },

  makeSortable: function () {

    var content = this.get('content');

    var originalIndex;

    this.$().sortable({
      helper: 'clone',

      start: function (event, ui) {
        originalIndex = ui.item.parent().children().index(ui.item);
      },
      stop: function  (event, ui) {

        var newIndex = ui.item.parent().children().index(ui.item);

        $(this).sortable('cancel');

        var movingItem = content.objectAt(originalIndex);
        content.removeAt(originalIndex);
        content.insertAt(newIndex, movingItem);

      }
    });

  },

  createChildView: function(viewClass, attrs) {

    viewClass = Ember.View.extend();

    if (Ember.isEmpty(this.get('itemTemplate'))) {
      viewClass.reopen({
        template: Ember.Handlebars.compile("{{view.content}}")
      });
    } else {
      viewClass.reopen({
        templateName: this.get('itemTemplate')
      });
    }

    if (!Ember.isEmpty(this.get('itemTagName'))) {
      viewClass.reopen({
        tagName: this.get('itemTagName')
      });
    }

    if (!Ember.isEmpty(this.get('itemClassNameBindings'))) {
      viewClass.reopen({
        classNameBindings: this.get('itemClassNameBindings').split(' ')
      });
    } else if (!Ember.isEmpty(this.get('itemClassNames'))) {
      viewClass.reopen({
        classNames: this.get('itemClassNames')
      });
    }

    return this._super(viewClass, attrs);
  }
});
