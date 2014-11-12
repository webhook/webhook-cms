import downcode from 'appkit/utils/downcode';
import ApplicationAdapter from 'appkit/adapters/application';
import ItemModel from 'appkit/models/item';
import ItemSerializer from 'appkit/serializers/item';

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

  itemModelName: function () {
    if (this.get('oneOff')) {
      return 'data';
    } else {
      return Ember.String.singularize(this.get('id'));
    }
  }.property('id', 'oneOff'),

  itemModelNamespace: function () {
    var itemModelName = this.get('itemModelName');
    return itemModelName.charAt(0).toUpperCase() + itemModelName.slice(1);
  }.property('itemModelName'),

  createItemModel: function () {

    var contentType = this;
    var modelNamespace = this.get('itemModelNamespace');

    if (contentType.get('oneOff') || window.App[modelNamespace]) {
      return;
    }

    // dynamic model
    window.App[modelNamespace] = ItemModel.extend();

    // dynamic adapter
    window.App[modelNamespace + 'Adapter'] = ApplicationAdapter.extend({
      // needs to be set here because it doesn't exist when adapter/item.js is parsed from the ItemAdapter import
      firebase: window.ENV.firebase.child('data')
    });

    // dynamic serializer
    window.App[modelNamespace + 'Serializer'] = ItemSerializer.extend();

    Ember.Logger.log('`%@` model created.'.fmt(modelNamespace));

  }.on('didLoad', 'didCreate'),

  deleteModel: function () {

    if (this.get('oneOff')) {
      return;
    }

    var modelNamespace = this.get('itemModelNamespace');
    window.App[modelNamespace] = null;
    window.App[modelNamespace + 'Adapter'] = null;
    window.App[modelNamespace + 'Serializer'] = null;

    Ember.Logger.log('`%@` model deleted.'.fmt(modelNamespace));

  }.on('didDelete')

});
