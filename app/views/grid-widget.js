import WidgetView from 'appkit/views/widget';

export default WidgetView.extend({

  isGridWidget: true,

  didInsertElement: function () {
    // override default so controls named `name` aren't hidden
  },

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
  }.observes('content.value'),

  templateVar: function () {

    var index = this.get('gridControl.value').indexOf(this.get('values'));

    return '{{ item.%@[%@].%@ }}'.fmt(this.get('gridControl.name'), index, this.get('content.name'));

  }.property('content.name', 'gridControl.name', 'gridControl.value.length')

});
