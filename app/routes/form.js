export default Ember.Route.extend({
  model: function (params) {
    return this.store.find('content-type', params.id);
  },
  setupController: function (controller, model) {
    controller.set('editingControl', null);
    controller.set('isEditing', false);
    controller.set('controlTypeGroups', this.get('store').find('control-type-group'));
    this._super.apply(this, arguments);
  }
});
