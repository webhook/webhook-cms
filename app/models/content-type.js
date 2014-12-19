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
  }.property('indexingPercent'),


  // Permissions

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

  disableControls: function () {
    if (this.get('canDraft')) {
      this.get('controls').setEach('disabled', false);
    } else {
      this.get('controls').setEach('disabled', true);
    }
  }.observes('canDraft').on('didLoad'),

  permission: null,

  canView: function () {
    var permission = this.get('permission');
    return !permission || permission !== 'none';
  }.property('permission'),

  canDraft: function () {
    var permission = this.get('permission');
    return !permission || ['draft', 'publish', 'delete'].contains(permission);
  }.property('permission'),

  canPublish: function () {
    var permission = this.get('permission');
    return !permission || ['publish', 'delete'].contains(permission);
  }.property('permission'),

  canDelete: function () {
    var permission = this.get('permission');
    return !permission || permission === 'delete';
  }.property('permission'),

  observePermission: function () {
    var model = this;
    this.addObserver('session.user.permissions.' + this.get('id'), function () {
      model.set('permission', model.get('session.user.permissions.' + this.get('id')));
    });
    model.set('permission', model.get('session.user.permissions.' + this.get('id')));
  }.on('didLoad'),


  // make sure `create_date`, `last_updated`, `publish_date`, `preview_url`, `slug` controls exist
  verifyControls: function () {

    var controls = this.get('controls');
    var newControls = Ember.A([]);

    if (!controls.isAny('name', 'create_date')) {
      newControls.push(this.store.createRecord('control', {
        controlType: this.store.getById('control-type', 'datetime'),
        name       : 'create_date',
        label      : 'Create Date',
        locked     : true,
        showInCms  : true,
        required   : true,
        hidden     : true
      }));
    }

    if (!controls.isAny('name', 'last_updated')) {
      newControls.push(this.store.createRecord('control', {
        controlType: this.store.getById('control-type', 'datetime'),
        name       : 'last_updated',
        label      : 'Last Updated',
        locked     : true,
        showInCms  : true,
        required   : true,
        hidden     : true
      }));
    }

    if (!controls.isAny('name', 'publish_date') && !this.get('oneOff')) {
      newControls.push(this.store.createRecord('control', {
        controlType: this.store.getById('control-type', 'datetime'),
        name       : 'publish_date',
        label      : 'Publish Date',
        locked     : true,
        showInCms  : true,
        required   : false,
        hidden     : true
      }));
    }

    if (!controls.isAny('name', 'preview_url')) {
      newControls.push(this.store.createRecord('control', {
        controlType: this.store.getById('control-type', 'textfield'),
        name       : 'preview_url',
        label      : 'Preview URL',
        locked     : true,
        showInCms  : false,
        required   : true,
        hidden     : true
      }));
    }

    if (!controls.isAny('name', 'slug')) {
      newControls.push(this.store.createRecord('control', {
        controlType: this.store.getById('control-type', 'textfield'),
        name       : 'slug',
        label      : 'Slug',
        locked     : true,
        showInCms  : false,
        required   : false,
        hidden     : true
      }));
    }

    if (newControls.get('length')) {

      var contentTypeModel = this.store.modelFor('content-type');
      var contentTypeAdapter = this.store.adapterFor('content-type');
      var controlsRef = contentTypeAdapter._getRef(contentTypeModel, this.get('id')).child('controls');

      var controlsCount = controls.get('length');
      var data = {};

      var controlPromises = Ember.A([]);

      newControls.forEach(function (control, index) {

        controls.addObject(control);

        controlPromises.push(new Ember.RSVP.Promise(function (resolve, reject) {
          controlsRef.child(controlsCount + index).set(control.serialize(), function (error) {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        }));

      });

      return Ember.RSVP.Promise.all(controlPromises);

    } else {
      return Ember.RSVP.resolve();
    }

  }

});
