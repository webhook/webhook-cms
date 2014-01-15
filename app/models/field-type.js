var FieldType = DS.Model.extend({
  name: DS.attr('string')
});

FieldType.FIXTURES = [
  { id: 1, name: 'input' },
  { id: 2, name: 'textarea' },
  { id: 3, name: 'wysiwyg' }
];

export default FieldType;
