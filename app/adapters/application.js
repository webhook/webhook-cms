export default DS.FirebaseAdapter.extend({
  firebase: window.ENV.firebase,
  pathForType: function (type) {
    return Ember.String.camelize(type);
  }
});
