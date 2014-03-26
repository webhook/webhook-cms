export default Ember.Route.extend({

  model: function () {
    var searchQuery = this.controllerFor('wh').get('searchQuery');
    return new Ember.RSVP.Promise(function (resolve, reject) {
      if (searchQuery) {
        window.ENV.search(searchQuery, 1, function(err, data) {
          if (err) {
            Ember.run(null, reject, err);
          } else {
            Ember.run(null, resolve, data);
          }
        });
      } else {
        Ember.run(null, resolve, Ember.A([]));
      }
    }.bind(this));
  }

});
