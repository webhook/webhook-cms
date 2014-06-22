export default Ember.View.extend({
  tagName: 'span',

  emptyStar: "&#xf006;",
  fullStar: "&#xf005;",

  letterSpacing: 3,

  didInsertElement: function () {

    var rating = this;
    var options = this.get('control.meta.data');
    this.set('options', Ember.Object.create({
      min: parseInt(options.min, 10),
      max: parseInt(options.max, 10),
      step: parseFloat(options.step)
    }));

    this.$().css({
      display: 'inline-block',
      maxWidth: '100%',
      letterSpacing: this.get('letterSpacing'),
      color: '#b3b3b3',
      fontFamily: 'hook',
      verticalAlign: 'top',
      position: 'relative',
      cursor: 'pointer'
    });

    rating.$().html(new Array(this.get('options.max') + 1).join(rating.get('emptyStar')));

    rating.set('stars', this.$('<span>').css({
      position: 'absolute',
      top: 0,
      left: 0,
      overflow: 'hidden'
    }).html(new Array(this.get('options.max') + 1).join(rating.get('fullStar'))));

    rating.get('stars').appendTo(rating.$());

    rating.$().on('mousemove', function (event) {
      var number = event.offsetX / rating.$().width() * rating.get('options.max');
      var inverseStep = 1 / rating.get('options.step');
      var newValue = Math.ceil(number * inverseStep) / inverseStep;

      rating.set('value', newValue < rating.get('options.min') ? rating.get('options.min') : newValue);
    });

    rating.$().on('mouseout', function (event) {
      rating.set('value', rating.getWithDefault('control.value', rating.get('options.min')));
    });

    rating.$().on('click', function () {
      rating.set('control.value', rating.get('value'));
    });

    rating.set('value', rating.getWithDefault('control.value', rating.get('options.min')));

  },

  updateStars: function () {

    var value = this.get('value'),
        wholes = Math.floor(value),
        starWidth = this.$().width() / this.get('options.max'),
        remainder = ((value - wholes) * starWidth) - this.get('letterSpacing') / 2;

    this.get('stars').width((starWidth * wholes) + (remainder));

  }.observes('value')

});
