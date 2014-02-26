import validateControls from 'appkit/utils/validators';
import dataFromControls from 'appkit/utils/controls';

export default Ember.ObjectController.extend({
  type       : null,
  lastUpdated: null,
  createDate : null,

  saveItem: function () {

    // automatically update `update_date`
    this.get('type.controls').filterBy('name', 'last_updated').setEach('value', moment().format('YYYY-MM-DDTHH:mm'));

    validateControls(this.get('type.controls'));

    if (this.get('type.controls').isAny('widgetIsValid', false)) {
      return;
    }

    var data = dataFromControls(this.get('type.controls'));

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

  }
});
