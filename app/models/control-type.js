var ControlType = DS.Model.extend({
  name     : DS.attr('string'),
  group    : DS.belongsTo('control-type-group'),
  iconClass: DS.attr('string'),
  widget   : DS.attr('string', { defaultValue: 'textfield' }),

  // The following are used as defaults for new controls of this type
  label      : DS.attr('string'),
  placeholder: DS.attr('string'),
  help       : DS.attr('string'),

  valueType  : DS.attr('string', { defaultValue: 'string' }),

  controlPartialPath: function () {
    return 'widgets/' + this.get('widget');
  }.property('widget'),
  infoPartialPath: function () {
    return 'widgets/info/' + this.get('widget');
  }.property('widget'),
  valuePartialPath: function () {
    return 'widgets/value/' + this.get('widget');
  }.property('widget')
});

var fixtures = [];

var controlTypeGroupId = 0,
    controlTypeId = 0;

$.each(window.ENV.controlTypeGroups, function (index, group) {
  controlTypeGroupId++;
  $.each(group.controlTypes, function (index, control) {
    fixtures.push($.extend({
      id: control.widget,
      group: controlTypeGroupId
    }, control));
  });
});

ControlType.reopenClass({
  FIXTURES: fixtures
});

export default ControlType;
