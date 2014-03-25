var App;

module('Acceptances - Index', {
  setup: function(){
    App = startApp();
  },
  teardown: function() {
    Ember.Logger.info('DESTROY APP');
    Ember.run(App, 'destroy');
  }
});

asyncTest('index renders', function(){
  expect(1);

  visit('/').then(function(){
    Ember.Logger.info('look for login');
    var loginForm = find('.wh-login');
    equal(loginForm.length, 1);
    start();
  });
});
