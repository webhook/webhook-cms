export default Ember.Route.extend({
  model: function (params) {
    return this.store.find('content-type', params.id);
  },
  setupController: function (controller, model) {
    controller.set('editingField', null);
    controller.set('fieldTypeGroups', this.get('store').find('field-type-group'));
    this._super.apply(this, arguments);
  }
});
