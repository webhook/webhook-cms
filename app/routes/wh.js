export default Ember.Route.extend({
  model: function () {

    // "A record can also enter the empty state if the adapter is unable to locate the record."
    // We do not want to show those records so filter them out.
    return this.store.find('content-type').then(function (contentTypes) {
      return contentTypes.filterBy('currentState.isEmpty', false);
    });

  }
});
