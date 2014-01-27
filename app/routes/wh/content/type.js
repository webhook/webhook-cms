export default Ember.Route.extend({
  model: function (params) {
    return this.store.find('content-type', params.type_id);
  }
});
