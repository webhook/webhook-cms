export default DS.FirebaseAdapter.extend({
  firebase: new Firebase("https://" + window.ENV.dbName + ".firebaseio.com/" + window.ENV.dbBucket)
});
