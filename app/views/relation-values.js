export default Ember.View.extend({

  limit: 3,

  slicedKeys: function () {
    return this.getWithDefault('relationKeys', []).slice(0, this.get('limit'));
  }.property('relationKeys')

});
