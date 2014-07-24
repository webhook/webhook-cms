export default Ember.Component.extend({

  posts: Ember.A([]),

  willInsertElement: function () {

    var component = this;

    $.ajax({
      url: 'http://www.webhook.com/blog-json/',
      dataType: 'jsonp',
      jsonpCallback: 'callback'
    }).success(function (data) {

      data.forEach(function (post) {
        component.get('posts').addObject(post);
      });
    });

  }
});
