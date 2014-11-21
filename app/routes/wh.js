export default Ember.Route.extend({
  model: function () {

    var permissions = this.get('session.user.permissions');

    if (Ember.isEmpty(permissions) || (typeof permissions === 'object' && !Ember.keys(permissions).length)) {
      return this.store.find('content-type');
    } else {
      var route = this;
      var promises = [];

      Ember.keys(permissions).forEach(function (contentTypeId) {
        if (permissions.get(contentTypeId) !== 'none') {
          promises.push(route.store.find('content-type', contentTypeId));
        }
      });

      return Ember.RSVP.allSettled(promises).then(function (promises) {
        promises = Ember.A(promises);
        promises.filterBy('state', 'rejected').forEach(function(promise) {
          var recordId = promise.reason.recordId;
          if (route.store.hasRecordForId('content-type', recordId)) {
            var record = route.store.getById('content-type', recordId);
            route.store.dematerializeRecord(record);
          }
        });
        return Ember.A(promises.filterBy('state', 'fulfilled')).mapBy('value');
      });
    }

  }
});
