// ensure we don't share routes between all Router instances
var Router = Ember.Router.extend({
  location: 'hash'
});

Router.map(function() {

  this.route('login');
  this.route('password-reset');
  this.route('create-user');
  this.route('confirm-email');
  this.route('resend-email');
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
      this.route('password-change');
    });

    this.resource('wh.content', { path: '/content/' }, function () {
      this.route('all-types');
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

});

export default Router;
