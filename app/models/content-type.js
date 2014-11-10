import downcode from 'appkit/utils/downcode';

export default DS.Model.extend({
  name    : DS.attr('string'),
  controls: DS.hasMany('control', { embedded: true }),
  oneOff  : DS.attr('boolean'),

  // scaffolding md5s
  individualMD5: DS.attr('string'),
  listMD5      : DS.attr('string'),
  oneOffMD5    : DS.attr('string'),

  // custom urls
  customUrls: DS.attr('json'),

  deleteModel: function (contentType) {

    var formattedTypeName = Ember.String.singularize(contentType.get('id')),
        modelName = formattedTypeName.charAt(0).toUpperCase() + formattedTypeName.slice(1);

    if (!contentType.get('oneOff')) {
      window.App[modelName] = null;
      window.App[modelName + 'Adapter'] = null;
      window.App[modelName + 'Serializer'] = null;
    }

  }.on('didDelete')

});
