export default Ember.Component.extend({

  tagName: 'span',

  date: function () {

    if (this.get('value') && moment(this.get('value')).isValid()) {
      return moment(this.get('value')).format('YYYY-MM-DD');
    } else {
      return null;
    }

  }.property('value'),

  time: function () {

    if (!this.get('value') || !moment(this.get('value')).isValid()) {
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
    var value = time ? (date + ' ' + time) : date;

    if (moment(value).isValid()) {
      this.set('value', moment(value).format());
    } else {
      this.set('value', null);
    }

  }.observes('date', 'time')
});
