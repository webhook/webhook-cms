var App;

module('Acceptances - Index', {
  setup: function(){
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

asyncTest('index renders', function(){
  expect(1);

  visit('/').then(function(){
    var loginForm = find('.wh-login');
    equal(loginForm.length, 0);
    start();
  });
});
