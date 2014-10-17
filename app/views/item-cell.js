export default Ember.View.extend({
  tagName: 'td',
  classNameBindings: ['controlClass'],
  controlClass: function () {
    return 'wh-item-row-' + this.get('context.controlType.widget');
  }.property()
});
