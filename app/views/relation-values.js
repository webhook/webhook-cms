export default Ember.View.extend({

  limit: 3,

  slicedKeys: function () {
    return this.getWithDefault('relationKeys', []).slice(0, this.get('limit'));
  }.property('relationKeys.@each'),

  more: function () {
    var delta = this.get('relationKeys.length') - this.get('limit');
    return delta > 0 ? delta : null;
  }.property('limit', 'relationKeys.@each')

});
