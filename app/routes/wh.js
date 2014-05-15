export default Ember.Route.extend({
  model: function () {

    // "A record can also enter the empty state if the adapter is unable to locate the record."
    // We do not want to show those records so filter them out.
    // Unfortunately our adapter doesn't support queries so we can't do live filtering.
    // todo: live filtering.
    return this.store.find('content-type');

  }
});
