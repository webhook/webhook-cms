export default DS.Model.extend({
  pattern: DS.attr('string'),
  destination: DS.attr('string'),

  isValid: function () {

    try {
      new RegExp(this.get('pattern'));
    } catch (error) {
      return false;
    }

    return true;

  }.property('pattern')
});
