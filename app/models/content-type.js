import downcode from 'appkit/utils/downcode';

export default DS.Model.extend({
  name    : DS.attr('string'),
  controls: DS.hasMany('control', { embedded: 'always' }),
  oneOff  : DS.attr('boolean'),

  // scaffolding md5s
  individualMD5: DS.attr('string'),
  listMD5      : DS.attr('string'),
  oneOffMD5    : DS.attr('string'),

  // custom urls
  customUrls: DS.attr('json')

});
