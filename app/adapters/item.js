export default DS.FirebaseAdapter.extend({
  dbName: window.ENV.dbName,
  dbBucket: window.ENV.dbBucket + '/data/'
});
