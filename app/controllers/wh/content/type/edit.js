import getItemModelName from 'appkit/utils/model';
import validateControls from 'appkit/utils/validators';
import dataFromControls from 'appkit/utils/controls';

export default Ember.ObjectController.extend({
  type        : null,
  lastUpdated : null,
  createDate  : null,
  isDraft     : null,
  publishDate : null,
  showSchedule: false,
  itemModel   : null,

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

    var controls = this.get('type.controls');

    // automatically update `update_date`
    controls.findBy('name', 'last_updated').set('value', moment().format('YYYY-MM-DDTHH:mm'));

    // sync publish date with controller
    controls.findBy('name', 'publish_date').set('value', this.get('publishDate'));

    // set create_date if missing
    if (!controls.findBy('name', 'create_date').get('value')) {
      controls.findBy('name', 'create_date').set('value', moment().format('YYYY-MM-DDTHH:mm'));
    }

    validateControls(this.get('type.controls'));

    if (this.get('type.controls').isAny('widgetIsValid', false)) {
      return;
    }

    var data = dataFromControls(this.get('type.controls'));

    data.isDraft = this.getWithDefault('isDraft', null);

    var itemModel = this.get('itemModel') || this.store.createRecord(getItemModelName(this.get('model')));

    itemModel.set('data', data).save().then(function () {

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
      this.set('publishDate', null);
      this.set('showSchedule', null);
      this.saveItem();
    },
    publishNow: function () {
      this.set('isDraft', null);
      this.set('publishDate', moment().format('YYYY-MM-DDTHH:mm'));
      this.saveItem();
    },
    publishFuture: function () {
      if (this.get('publishDate')) {
        this.set('isDraft', null);
        this.saveItem();
      } else {
        window.alert('Set a publish date');
      }
    },
    changePublishDate: function () {
      this.set('isDraft', null);
      this.set('publishDate', moment().format('YYYY-MM-DDTHH:mm'));
      this.set('showSchedule', true);
    },
    deleteItem: function () {
      if (window.confirm('Are you sure?')) {
        this.get('model').destroyRecord();
        this.transitionToRoute('wh.content.type', this.get('type'));
      }
    },
    setPublishNow: function () {
      this.set('publishDate', moment().format('YYYY-MM-DDTHH:mm'));
    }
  }
});
