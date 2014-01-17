var FieldType = DS.Model.extend({
  name: DS.attr('string')
});

FieldType.FIXTURES = [
  { id: 1, name: 'text field' },
  { id: 2, name: 'textarea' },
  { id: 3, name: 'wysiwyg' },
  { id: 4, name: 'date' }
];

export default FieldType;
