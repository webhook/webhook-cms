export default Ember.Component.extend({
  tagName: 'span',
  classNames: 'colored-element',
  attributeBindings: ['customColor:style'],
  customColor: function () {
    return 'background-color:' + this.get('color');
  }.property('color')
});
