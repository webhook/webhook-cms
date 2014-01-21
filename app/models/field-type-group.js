var FieldTypeGroup = DS.Model.extend({
  name: DS.attr('string'),
  fields: DS.hasMany('field-type', { async: true })
});

FieldTypeGroup.FIXTURES = [];

var fieldTypeGroupId = 0,
    fieldTypeId = 0;

$.each(window.ENV.fieldTypeGroups, function (index, group) {
  fieldTypeGroupId++;
  FieldTypeGroup.FIXTURES.push({
    id: fieldTypeGroupId,
    name: group.name,
    fields: $.map(group.fields, function (field, index) {
      fieldTypeId++;
      return fieldTypeId;
    })
  });
});

export default FieldTypeGroup;
