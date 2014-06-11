export default Ember.Component.extend({
  tagName: 'span',
  classNames: 'wh-color-value',
  attributeBindings: ['customColor:style'],
  customColor: function () {
    return 'background-color:' + this.get('color');
  }.property('color')
});
