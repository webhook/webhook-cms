import getItemModelName from 'appkit/utils/model';
import validateControls from 'appkit/utils/validators';
import dataFromControls from 'appkit/utils/controls';
import uuid from 'appkit/utils/uuid';

export default Ember.ObjectController.extend({
  type        : null,
  lastUpdated : null,
  createDate  : null,
  isDraft     : null,
  publishDate : null,
  showSchedule: false,
  itemModel   : null,
  isDirty     : false,

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

  dirtyStateChanged: function () {
    if (this.get('isDirty')) {
      Ember.$(window).on('beforeunload', function () {
        return 'It looks like you have been editing something -- if you leave before submitting your changes will be lost.';
      });
    } else {
      Ember.$(window).off('beforeunload');
    }
  }.observes('isDirty'),

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

    // set preview_url if missing
    if (!controls.findBy('name', 'preview_url').get('value')) {
      controls.findBy('name', 'preview_url').set('value', uuid());
    }

    validateControls(this.get('type.controls'));

    if (this.get('type.controls').isAny('widgetIsValid', false)) {
      return;
    }

    var data = dataFromControls(this.get('type.controls'));

    data.isDraft = this.getWithDefault('isDraft', null);

    var itemModel = this.get('itemModel') || this.store.createRecord(getItemModelName(this.get('model')));

    itemModel.set('data', data).save().then(function (item) {

      this.set('isDirty', false);

      window.ENV.sendBuildSignal(data.publish_date);

      // One Off
      if (this.get('type.oneOff')) {
        this.send('notify', 'success', 'Saved and viewable live', {
          icon: 'ok-sign'
        });
      }

      // Draft
      else if (data.isDraft) {
        this.send('notify', 'info', 'Draft saved', {
          icon: 'ok-sign'
        });
      }

      // Live
      else if (data.publish_date && moment(data.publish_date).isBefore()) {
        this.send('notify', 'success', 'Saved and viewable live', {
          icon: 'ok-sign'
        });
      }

      // Future
      else {
        this.send('notify', 'info', 'Saved, will go live later', {
          icon: 'ok-sign'
        });
      }

      if (!this.get('itemModel')) {
        this.transitionToRoute('wh.content.type.edit', itemModel.get('id'));
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
    },

    removeTabularRow: function (row, control) {
      control.get('value').removeObject(row);
    },

    addTabularRow: function (control) {
      var emptyRow = Ember.A([]);
      control.get('meta.data.options').forEach(function () {
        emptyRow.pushObject(Ember.Object.create());
      });
      control.get('value').pushObject(emptyRow);
    }
  }
});
