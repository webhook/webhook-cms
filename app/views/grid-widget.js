import WidgetView from 'appkit/views/widget';

export default WidgetView.extend({

  content: function () {

    var control = this.get('rowControl');
    var store = control.get('store');

    // fighting with Ember to copy control
    var controlData = control.serialize();
    delete controlData.controls;
    controlData.controlType = control.get('controlType');

    var clone = store.createRecord('control', controlData);

    clone.set('value', this.get('values').get(control.get('name')));

    return clone;

  }.property(),

  valueChanged: function () {
    this.get('values').set(this.get('rowControl.name'), this.get('content.value'));
  }.observes('content.value')

});
