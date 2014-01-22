// ensure we don't share routes between all Router instances
var Router = Ember.Router.extend({
  location: window.location.protocol === 'file:' ? 'hash' : 'history'
});

Router.map(function() {

  this.resource('formbuilder',function() {
    this.route('create');
  });
  this.resource('content',function() {
    this.route('edit');
    this.route('list');
  });

  this.route('login');
  this.route('form', { path: '/form/:type' });
  this.resource('wh', function () {
    this.resource('wh.content', { path: '/content' }, function () {
      this.route('type', { path: '/:type' });
    });
  });

  this.route('component-test');
  this.route('helper-test');
  // this.resource('posts', function() {
  //   this.route('new');
  // });
});

export default Router;
