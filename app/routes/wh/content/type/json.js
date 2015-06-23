export default Ember.Route.extend({
  model: function (params) {
    return this.store.find(this.modelFor('wh.content.type').get('itemModelName'), params.item_id);
  },

  setupController: function (controller, model) {
    controller.set('itemJSON', JSON.stringify(model.get('itemData'), null, 2));
    controller.set('saving', false);
    controller.set('error', null);
    this._super.apply(this, arguments);
  },

  actions: {
    cancel: function () {
      this.transitionTo('wh.content.type', this.modelFor('wh.content.type').get('itemModelName'));
    }
  }
});
