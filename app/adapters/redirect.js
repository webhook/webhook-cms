import ApplicationAdapter from 'appkit/adapters/application';

export default ApplicationAdapter.extend({
  firebase: window.ENV.firebase.child('settings')
});
