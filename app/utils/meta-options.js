export default Ember.Object.extend({
  indexedOptions: function () {
    return this.get('options').map(function(option, index) {
      return { option: option, index: index };
    });
  }.property('options.@each'),
  isOneOption: function () {
    return this.get('options.length') === 1;
  }.property('options.length')
});
