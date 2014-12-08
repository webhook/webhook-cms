import WidgetView from 'appkit/views/widget';

export default WidgetView.extend({

  context: function () {

    var control = this.get('rowControl');
    var store = control.get('store');

    var clone = store.createRecord('control', control);

    clone.set('value', this.get('values').get(control.get('name')));

    return clone;

  }.property(),

  valueChanged: function () {
    this.get('values').set(this.get('rowControl.name'), this.get('context.value'));
  }.observes('context.value')

});
