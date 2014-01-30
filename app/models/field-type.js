var FieldType = DS.Model.extend({
  name     : DS.attr('string'),
  group    : DS.belongsTo('field-type-group', { async: true }),
  faClass: DS.attr('string'),
  widget   : DS.attr('string', { defaultValue: 'textfield' }),

  // The following are used as defaults for new fields of this type
  label      : DS.attr('string'),
  placeholder: DS.attr('string'),
  help       : DS.attr('string'),

  fieldPartialPath: function () {
    return 'widgets/' + this.get('widget');
  }.property('widget'),
  infoPartialPath: function () {
    return 'widgets/info/' + this.get('widget');
  }.property('widget'),
});

FieldType.FIXTURES = [];

var fieldTypeGroupId = 0,
    fieldTypeId = 0;

$.each(window.ENV.fieldTypeGroups, function (index, group) {
  fieldTypeGroupId++;
  $.each(group.fields, function (index, field) {
    fieldTypeId++;
    FieldType.FIXTURES.push($.extend({
      id: fieldTypeId,
      group: fieldTypeGroupId
    }, field));
  });
});

export default FieldType;
