export default Ember.View.extend({
  tagName: 'tr',

  click: function () {
    var controller = this.get('controller');
    var modelName = controller.get('itemModelName');
    var modelId = this.get('content.id');

    controller.transitionToRoute('wh.content.type.edit', modelName, modelId);
  }
});
