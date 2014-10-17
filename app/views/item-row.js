export default Ember.View.extend({
  tagName: 'tr',

  click: function () {
    this.get('controller')
      .transitionToRoute('wh.content.type.edit', this.get('controller.itemModelName'), this.get('context.id'));
  }
});
