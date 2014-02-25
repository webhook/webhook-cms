import getItemModelName from 'appkit/utils/model';
import validateControl from 'appkit/utils/validators';

export default Ember.ObjectController.extend({

  saveItem: function () {

    // automatically set the update and create dates to now
    this.get('model.controls').filter(function (control) {
      return control.get('name') === 'update_date' || control.get('name') === 'create_date';
    }).forEach(function (control) {
      control.set('value', moment().format('YYYY-MM-DDTHH:mm'));
    });

    var data = {};

    // gather and clean data for storage
    this.get('model.controls').filterBy('value').forEach(function (control) {
      var value = control.get('value');

      if (control.get('controlType.valueType') === 'object') {
        Ember.$.each(value, function (key, childValue) {
          if (!childValue) {
            delete value[key];
          }
        });
      }

      // add timezone to datetime values
      if (control.get('controlType.widget') === 'datetime') {
        value = moment(value).format();
      }

      data[control.get('name')] = value;
    });

    // checkboxes are special
    this.get('model.controls').filterBy('controlType.widget', 'checkbox').forEach(function (control) {
      data[control.get('name')] = [];
      control.get('meta.data.options').forEach(function (option) {
        data[control.get('name')].push(option);
      });
    });

    this.store.createRecord(getItemModelName(this.get('model')), {
      data: data
    }).save().then(function () {
      window.ENV.sendBuildSignal();

      this.send('notify', 'success', 'Item created!');
      this.transitionToRoute('wh.content.type', this.get('model'));
    }.bind(this));

  }

});
