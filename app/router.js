/*globals ga*/
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
  this.route('wordpress');
  this.route('reindex');
  this.route('import');

  this.route('expired');

  this.route('form', { path: '/form/:id' });

  this.resource('wh', function () {
    this.resource('wh.settings', { path: '/settings/' }, function () {
      this.route('billing');
      this.route('data');
      this.route('domain');
      this.route('general');
      this.route('team');
      this.route('password-change');
      this.route('urls');
    });

    this.route('search-global-results');
    this.resource('wh.content', { path: '/content/' }, function () {
      this.route('all-types');
      this.route('start');

      this.resource('wh.content.type', { path: '/:type_id' }, function () {
        this.route('index', { path: '/' });
        this.route('edit', { path: '/:item_id' });
        this.route('json', { path: '/:item_id/json' });
        this.route('new');
      });

    });
  });

  this.route('component-test');
  this.route('helper-test');

});

Router.reopen({
  notifyAnalytics: function() {
    var dim1 = Ember.$('meta[name="siteName"]').attr('content');
    Ember.Logger.log('Sending pageview to analytics.', dim1);

    ga('set', 'dimension1', dim1);
    ga('send', 'pageview');
  }.on('didTransition')
});

export default Router;
