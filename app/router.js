// ensure we don't share routes between all Router instances
var Router = Ember.Router.extend({
  location: window.location.protocol === 'file:' ? 'hash' : 'history'
});

Router.map(function() {

  this.resource('formbuilder',function() {
    this.route('create');
  });

  this.route('login');
  this.route('password-reset');
  this.route('password-change');
  this.route('start');
  this.route('theme');

  this.route('form', { path: '/form/:id' });

  this.resource('wh', function () {
    this.resource('wh.settings', { path: '/settings/' }, function () {
      this.route('billing');
      this.route('data');
      this.route('domain');
      this.route('general');
      this.route('team');
    });

    this.resource('wh.content', { path: '/content/' }, function () {
      this.route('start');

      this.resource('wh.content.type', { path: '/:type_id' }, function () {
        this.route('index', { path: '/' });
        this.route('edit', { path: '/:item_id' });
        this.route('new');
      });

    });
  });

  this.route('component-test');
  this.route('helper-test');
  // this.resource('posts', function() {
  //   this.route('new');
  // });
});

export default Router;
