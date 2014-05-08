export default Ember.Component.extend({
  date: function () {
    return moment(this.get('value')).format('YYYY-MM-DD');
  }.property('value'),

  time: function () {

    if (moment(this.get('value')).minutes() + moment(this.get('value')).hours() === 0) {
      return null;
    }

    return moment(this.get('value')).format('HH:mm');
  }.property('value'),

  datetimeChanged: function () {
    var date = this.get('date');
    var time = this.getWithDefault('time', '00:00');
    this.set('value', date + 'T' + time);
  }.observes('date', 'time')
});
