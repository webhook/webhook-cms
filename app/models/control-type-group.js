var ControlTypeGroup = DS.Model.extend({
  name: DS.attr('string'),
  controlTypes: DS.hasMany('control-type', { async: true })
});

var fixtures = [];

var controlTypeGroupId = 0,
    controlTypeId = 0;

$.each(window.ENV.controlTypeGroups, function (index, group) {
  controlTypeGroupId++;
  fixtures.push({
    id: controlTypeGroupId,
    name: group.name,
    controlTypes: $.map(group.controlTypes, function (control, index) {
      return control.widget;
    })
  });
});

ControlTypeGroup.reopenClass({
  FIXTURES: fixtures
});

export default ControlTypeGroup;
