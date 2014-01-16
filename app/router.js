// ensure we don't share routes between all Router instances
var Router = Ember.Router.extend({
  location: window.location.protocol === 'file:' ? 'hash' : 'history'
});

Router.map(function() {

  this.route('formbuilder');
  this.resource('content',function() {
    this.route('edit');
    this.route('list');
  });

  this.resource('content-type-test', function () {
    this.route('create');
    this.route('type', { path: '/:type' });
  });

  this.route('component-test');
  this.route('helper-test');
  // this.resource('posts', function() {
  //   this.route('new');
  // });
});

export default Router;
