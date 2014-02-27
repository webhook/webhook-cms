import validateControls from 'appkit/utils/validators';
import dataFromControls from 'appkit/utils/controls';

export default Ember.ObjectController.extend({
  type       : null,
  lastUpdated: null,
  createDate : null,
  isDraft    : null,
  publishDate: null,
  showSchedule: false,

  isLive: function () {
    if (this.get('showSchedule')) {
      return false;
    }
    if (!this.get('publishDate') || this.get('isDraft')) {
      return false;
    }
    return moment(this.get('publishDate')).isBefore();
  }.property('publishDate', 'isDraft', 'showSchedule'),

  isScheduled: function () {
    if (this.get('showSchedule')) {
      return true;
    }
    if (!this.get('publishDate') || this.get('isDraft')) {
      return false;
    }
    return moment(this.get('publishDate')).isAfter();
  }.property('publishDate', 'isDraft', 'showSchedule'),

  saveItem: function () {

    // automatically update `update_date`
    this.get('type.controls').filterBy('name', 'last_updated').setEach('value', moment().format('YYYY-MM-DDTHH:mm'));

    // make sure `create_date` is set
    this.get('type.controls').filterBy('name', 'create_date').rejectBy('value').setEach('value', moment().format('YYYY-MM-DDTHH:mm'));

    validateControls(this.get('type.controls'));

    if (this.get('type.controls').isAny('widgetIsValid', false)) {
      return;
    }

    var data = dataFromControls(this.get('type.controls'));

    data.isDraft = this.getWithDefault('isDraft', null);
    data.publishDate = this.get('publishDate') ? moment(this.get('publishDate')).format() : null;

    this.get('model').set('data', data).save().then(function () {

      window.ENV.sendBuildSignal();

      this.send('notify', 'success', 'Item saved!', {
        icon: 'ok-sign'
      });

      if (!this.get('type.oneOff')) {
        this.get('type.controls').setEach('value', null);
        this.transitionToRoute('wh.content.type', this.get('type'));
      }
    }.bind(this));

  },

  actions: {
    saveDraft: function () {
      this.set('isDraft', true);
      this.set('showSchedule', null);
      this.saveItem();
    },
    publishNow: function () {
      this.set('isDraft', null);
      this.set('publishDate', moment().format());
      this.saveItem();
    },
    publishFuture: function () {
      this.set('isDraft', null);
      this.saveItem();
    },
    changePublishDate: function () {
      this.set('isDraft', null);
      this.set('showSchedule', true);
    },
    deleteItem: function () {
      if (window.confirm('Are you sure?')) {
        this.get('model').destroyRecord();
        this.transitionToRoute('wh.content.type', this.get('type'));
      }
    }
  }
});
