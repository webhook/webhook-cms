import WidgetView from 'appkit/views/widget';

export default WidgetView.extend({

  didInsertElement: function () {
    this.set('gridControlIndex', this.$().parents('.wy-control-group-grid').find('.wy-control-group').index(this.$()));
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
    return '{{ item.%@[%@].%@ }}'.fmt(this.get('gridControl.name'), this.get('gridControlIndex'), this.get('content.name'));
  }.property('content.name', 'gridControl.name', 'gridControlIndex')

});
