export default Ember.View.extend({
  tagName: 'span',
  classNames: ['wy-star'],
  classNameBindings: ['stars'],

  stars: function () {
    var classStr = 'wy-star-',
        value = this.get('value'),
        wholes = Math.floor(value),
        half = value > wholes;

    return classStr + wholes + (half ? 'dot5' : '');
  }.property('value'),

  didInsertElement: function () {

    var self = this,
        options = this.get('control.meta.data'),
        $element = this.$();

    self.set('value', self.getWithDefault('control.value', 0));

    $element.on('mousemove', function (event) {
      var number = event.offsetX / $element.width() * options.max;
      self.set('value', Math.round(number * (1 / options.step)) / (1 / options.step));
    });

    $element.on('mouseout', function () {
      self.set('value', self.getWithDefault('control.value', 0));
    });

    $element.on('click', function () {
      self.set('control.value', self.get('value'));
    });

  }

});
