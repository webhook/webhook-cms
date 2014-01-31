export default Ember.Route.extend({
  model: function (params) {
    return this.store.find('content-type', params.id);
  },
  setupController: function (controller, model) {

    this.get('store').find('control-type-group').then(function (groups) {
      window.console.log(groups.get('length'));
    });

    controller.set('editingControl', null);
    controller.set('controlTypeGroups', this.get('store').find('control-type-group'));
    this._super.apply(this, arguments);
  }
});
