export default Ember.Object.extend({
  key: null,
  email: null,
  owner: false,
  user: false,
  potential: false,
  isUser: function () {
    return this.get('owner') || this.get('user') || this.get('potential');
  }.property('owner', 'user', 'potential')
});
