import getItemModelName from 'appkit/utils/model';
import validateControls from 'appkit/utils/validators';
import dataFromControls from 'appkit/utils/controls';

export default Ember.ObjectController.extend({

  saveItem: function () {

    // automatically set `last_updated` and `create_date` to now
    this.get('model.controls').filter(function (control) {
      return control.get('name') === 'last_updated' || control.get('name') === 'create_date';
    }).setEach('value', moment().format('YYYY-MM-DDTHH:mm'));

    validateControls(this.get('model.controls'));

    if (this.get('model.controls').isAny('widgetIsValid', false)) {
      return;
    }

    var data = dataFromControls(this.get('model.controls'));

    this.store.createRecord(getItemModelName(this.get('model')), {
      data: data
    }).save().then(function () {
      window.ENV.sendBuildSignal();

      this.send('notify', 'success', 'Item created!', {
        icon: 'ok-sign'
      });

      this.transitionToRoute('wh.content.type', this.get('model'));
    }.bind(this));

  }

});
