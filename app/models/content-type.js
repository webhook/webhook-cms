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

  }.on('didDelete'),

  addPermissions: function () {
    var siteName = this.get('session.site.name');
    var contentTypeId = this.get('id');

    // remove permissions from groups
    // this should cascade to users
    this.get('team.groups').forEach(function (group) {
      var groupKey = group.get('key');
      window.ENV.firebaseRoot
      .child('management/sites')
      .child(siteName)
      .child('groups')
      .child(groupKey)
      .child('permissions')
      .child(contentTypeId)
      .set('none');
    });
  }.on('didCreate'),

  removePermissions: function () {
    var siteName = this.get('session.site.name');
    var contentTypeId = this.get('id');

    // remove permissions from groups
    // this should cascade to users
    this.get('team.groups').forEach(function (group) {
      var groupKey = group.get('key');
      window.ENV.firebaseRoot
      .child('management/sites')
      .child(siteName)
      .child('groups')
      .child(groupKey)
      .child('permissions')
      .child(contentTypeId)
      .remove();
    });
  }.on('didDelete'),

  indexingTotal: 0,
  indexingComplete: 0,

  indexingPercent: function () {
    if (this.get('indexingTotal') === 0) {
      return 100;
    }
    return Math.floor(this.get('indexingComplete') / this.get('indexingTotal') * 100);
  }.property('indexingTotal', 'indexingComplete'),

  isIndexing: function () {
    var percent = this.get('indexingPercent');
    return percent > 0 && percent < 100;
  }.property('indexingPercent'),

  indexingClass: function () {
    var percent = this.get('indexingPercent');
    if (percent === 0) {
      return 'pending';
    }
    if (percent < 100) {
      return 'active';
    }
    if (percent === 100) {
      return 'complete';
    }
  }.property('indexingPercent')

});
