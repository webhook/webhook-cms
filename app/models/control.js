export default DS.Model.extend({
  name       : DS.attr('string'),
  label      : DS.attr('string'),
  placeholder: DS.attr('string'),
  help       : DS.attr('string'),
  required   : DS.attr('boolean'),
  controlType: DS.belongsTo('control-type'),
  showInCms  : DS.attr('boolean'),
  locked     : DS.attr('boolean'),
  hidden     : DS.attr('boolean'),
  meta       : DS.belongsTo('meta-data', { embedded: 'always' }),

  setName: function () {
    if (!this.get('locked') && this.get('label')) {
      this.set('name', this.get('label').toLowerCase().replace(/\s+/g, '_').replace(/(\W|[A-Z])/g, ''));
    } else {
      this.set('name', this.get('controlType.name').toLowerCase().replace(/\s+/g, '_').replace(/(\W|[A-Z])/g, ''));
    }
  }.observes('label')
});
