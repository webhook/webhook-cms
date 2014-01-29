import ApplicationAdapter from 'appkit/adapters/application';

export default ApplicationAdapter.extend({
  firebase: new Firebase("https://" + window.ENV.dbName + ".firebaseio.com/" + window.ENV.dbBucket + "/data/"),
});
