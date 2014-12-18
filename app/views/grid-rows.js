export default Ember.CollectionView.extend({

  content: function () {
    return this.get('gridControl.value');
  }.property(),

  updateToggle: false,

  didInsertElement: function () {

    var originalIndex;
    var collectionView = this;

    this.$().sortable({
      helper     : 'clone',
      axis       : 'y',
      handle     : '.wh-grid-value',

      start: function (event, ui) {
        originalIndex = ui.item.parent().children().index(ui.item);
      },

      update: function (event, ui) {

        var newIndex = ui.item.parent().children().index(ui.item);

        $(this).sortable('cancel');

        var rows = collectionView.get('content');
        var row = rows.objectAt(originalIndex);

        rows.removeAt(originalIndex);
        rows.insertAt(newIndex, row);

        collectionView.toggleProperty('updateToggle');

      }
    });
  },

  itemViewClass: Ember.View.extend({
    templateName: 'grid-row',

    classNames: ['wh-grid-item'],

    classNameBindings: [
      'isActive:active',
      'isFirstRow:first',
      'isLastRow:last'
    ],

    firstControl: function () {
      // {{#each rowControl in view.parentView.gridControl.controls}}

      var control = this.get('parentView.gridControl.controls.firstObject');
      var store = control.get('store');

      // fighting with Ember to copy control
      var controlData = control.serialize();
      delete controlData.controls;
      controlData.controlType = control.get('controlType');

      var clone = store.createRecord('control', controlData);

      clone.set('value', this.get('content').get(control.get('name')));

      var content = this.get('content');
      content.addObserver(control.get('name'), function () {
        clone.set('value', content.get(control.get('name')));
      });

      return clone;
    }.property('parentView.gridControl.controls.firstObject.controlType.widget'),

    isActive: function () {
      return this.get('parentView.context.activeRows').indexOf(this.get('rowIndex')) >= 0;
    }.property('parentView.context.activeRows.length', 'rowIndex'),

    rowIndex: function () {
      return this.get('parentView.content').indexOf(this.get('content'));
    }.property('parentView.content.length', 'parentView.updateToggle'),

    rowIndex1: function () {
      return this.get('rowIndex') + 1;
    }.property('rowIndex'),

    isFirstRow: function () {
      return this.get('rowIndex') === 0;
    }.property('rowIndex'),

    isLastRow: function () {
      return this.get('rowIndex') === this.get('parentView.content.length') - 1;
    }.property('rowIndex'),

    scrollToRow: function () {
      if (this.get('rowIndex') === this.get('parentView.context.focusOnRow')) {
        $('html, body').animate({
          scrollTop: this.$().offset().top
        }, 1000);
      }
    }.observes('parentView.context.focusOnRow', 'rowIndex')

  })

});
