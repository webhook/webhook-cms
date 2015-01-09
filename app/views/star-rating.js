export default Ember.View.extend({
  tagName: 'span',

  emptyStar: "&#xf006;",
  fullStar: "&#xf005;",

  letterSpacing: 3,

  options: function () {

    var options = this.get('control.meta');

    return Ember.Object.create({
      min: parseInt(options.min || 0, 10),
      max: parseInt(options.max || 0, 10),
      step: parseFloat(options.step || 0)
    });

  }.property('control.meta.max'),

  didInsertElement: function () {

    var rating = this;

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

    rating.set('empties', rating.$('<span>').css({
      position: 'relative',
      zIndex: 2
    }));
    rating.get('empties').appendTo(rating.$());
    rating.setEmpties();

    rating.set('stars', rating.$('<span>').css({
      position: 'absolute',
      top: 0,
      left: 0,
      overflow: 'hidden',
      zIndex: 1
    }).html(new Array(rating.get('options.max') + 1).join(rating.get('fullStar'))));

    rating.get('stars').appendTo(rating.$());

    rating.set('value', rating.getWithDefault('control.value', rating.get('options.min')));

    if (this.get('control.disabled')) {
      return;
    }

    rating.$().on('mousemove', function (event) {

      var offset = event.pageX - rating.$().offset().left;

      var number = offset / rating.$().width() * rating.get('options.max');
      var inverseStep = 1 / rating.get('options.step');
      var newValue = Math.ceil(number * inverseStep) / inverseStep;

      var value = newValue < rating.get('options.min') ? rating.get('options.min') : newValue;

      rating.set('value', value);
    });

    rating.$().on('mouseout', function () {
      rating.set('value', rating.getWithDefault('control.value', rating.get('options.min')));
    });

    rating.$().on('click', function () {
      rating.set('control.value', rating.get('value'));
    });

  },

  setEmpties: function () {
    this.get('empties').html(new Array(this.getWithDefault('options.max', 0) + 1).join(this.get('emptyStar')));
  },

  maxChanged: function () {
    this.setEmpties();
  }.observes('control.meta.max'),

  updateStars: function () {

    var value = this.get('value'),
        wholes = Math.floor(value),
        starWidth = this.$().width() / this.get('options.max'),
        remainder = ((value - wholes) * starWidth) - this.get('letterSpacing') / 2;

    this.get('stars').width((starWidth * wholes) + (remainder));

  }.observes('value')

});
