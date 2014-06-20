export default Ember.Component.extend({
  date: function () {

    if (this.get('value')) {
      return moment(this.get('value')).format('YYYY-MM-DD');
    } else {
      return null;
    }

  }.property('value'),

  time: function () {

    if (!this.get('value')) {
      return null;
    }

    if (moment(this.get('value')).minutes() + moment(this.get('value')).hours() === 0) {
      return null;
    }

    return moment(this.get('value')).format('HH:mm');
  }.property('value'),

  datetimeChanged: function () {

    var date = this.get('date');
    var time = this.get('time');

    this.set('value', time ? (date + 'T' + time) : date);

  }.observes('date', 'time')
});
