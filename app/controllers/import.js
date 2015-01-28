import Reindex from 'appkit/controllers/reindex';

var ImportedContentType = Ember.Object.extend({
  isValid: function () {
    return Ember.isEmpty(this.get('errors'));
  }.property('errors.length')
});

var ImportedControl = Ember.Object.extend({
  isValid: function () {
    return Ember.isEmpty(this.get('errors'));
  }.property('errors.length')
});

export default Reindex.extend({

  importData: null,
  importDataErrors: Ember.A([]),

  // Remove extraneous data
  validateData: function (rawData) {

    this.set('importData', Ember.Object.create());

    this.set('importData.contentTypes', this.validateContentTypesData(rawData.contentType));

    this.set('importData.data', this.validateItemsData(rawData.data));

    this.set('importData.settings', this.validateSettingsData(rawData.settings));

  },

  // Make sure content types have controls
  validateContentTypesData: function (data) {

    var controller = this,
        store = this.store;

    var contentTypes = Ember.A([]);

    Ember.Logger.log('%cValidating content types for import.', 'color: green; font-weight: bold');

    Ember.$.each(data || {}, function (contentTypeId, contentTypeData) {

      var contentType = ImportedContentType.create({
        id: contentTypeId,
        oneOff: !!contentTypeData.oneOff,
        errors: Ember.A([]),
        controls: Ember.A([])
      });

      Ember.Logger.log('- `%@`'.fmt(contentTypeId));

      if (Ember.isEmpty(contentTypeData.controls)) {
        contentType.get('errors').pushObject('Missing controls.');
      } else if (!Ember.isArray(contentTypeData.controls)) {
        contentType.get('errors').pushObject('`controls` is not an array.'.fmt(contentTypeId));
      } else {
        contentType.get('controls').pushObjects(controller.validateControlsData(contentTypeData.controls));
      }

      Ember.Logger.log('-- %@ general errors.'.fmt(contentType.get('errors.length')));
      contentType.get('errors').forEach(function (error) {
        Ember.Logger.warn('--- %@'.fmt(error));
      });

      if (!Ember.isEmpty(contentType.get('controls'))) {
        var controlErrorsCount = contentType.get('controls').reduce(function (count, control) {
          return count + control.get('errors.length');
        }, 0);
        Ember.Logger.log('-- %@ control errors.'.fmt(controlErrorsCount));
        contentType.get('controls').forEach(function (control) {
          control.get('errors').forEach(function (error) {
            Ember.Logger.warn('--- %@: %@'.fmt(control.get('name'), error));
          });
        });
      }

      // Only pass along the data if we are error free
      if (Ember.isEmpty(contentType.get('errors')) && Ember.isEmpty(contentType.get('controls').filterBy('errors.length'))) {
        contentType.set('data', contentTypeData);
      }

      contentTypes.pushObject(contentType);

    });

    return contentTypes;

  },

  // Make sure controls use known widgets
  validateControlsData: function (data) {

    var store = this.store,
        controls = Ember.A([]);

    // validate controls
    (data || []).forEach(function (controlData) {

      var control = ImportedControl.create({
        name: controlData.name,
        errors: Ember.A([])
      });

      // recognized controlType
      if (typeof controlData.controlType !== 'string') {
        control.get('errors').pushObject('`controlType` is not string.');
      } else if (Ember.isNone(store.getById('control-type', controlData.controlType))) {
        control.get('errors').pushObject('Unrecognized `controlType`: "%@"'.fmt(controlData.controlType));
      }

      // no errors, add data
      if (Ember.isEmpty(control.get('errors'))) {
        control.set('data', controlData);
      }

      controls.pushObject(control);

    });

    return controls;

  },

  // Make sure items belong to known content types
  validateItemsData: function (data) {

    var controller = this,
        store = this.store;

    var contentTypeData = this.get('importData.contentTypes');

    var validData = Ember.A([]);

    Ember.Logger.log('%cValidating item data for import.', 'color: green; font-weight: bold');

    Ember.$.each(data || {}, function (contentTypeId, itemData) {

      var contentType = ImportedContentType.create({
        id: contentTypeId,
        errors: Ember.A([]),
        items: Ember.A([])
      });

      Ember.Logger.log('- `%@`'.fmt(contentTypeId));

      var existingContentType = contentTypeData.findBy('id', contentTypeId) || store.getById('content-type', contentTypeId);

      // Check if content type exists for data
      if (Ember.isEmpty(existingContentType)) {
        contentType.get('errors').pushObject('Corresponding `%@` content type not found for item data.'.fmt(contentTypeId));
      } else if (typeof itemData === 'string' || Ember.isArray(itemData)) {
        contentType.get('errors').pushObject('Item data must be an object of key value pairs.');
      } else if (existingContentType.get('oneOff')) {
        contentType.set('oneOff', true);
        contentType.set('items', controller.validateItems([itemData]).objectAt(0));
      } else {
        contentType.set('oneOff', false);
        contentType.get('items').pushObjects(controller.validateItems(itemData));
      }

      Ember.Logger.log('-- %@ general errors.'.fmt(contentType.get('errors.length')));
      contentType.get('errors').forEach(function (error) {
        Ember.Logger.warn('--- %@'.fmt(error));
      });

      if (!Ember.isEmpty(contentType.get('itemData'))) {
        var itemDataErrorsCount = contentType.get('itemData').reduce(function (count, itemData) {
          return count + itemData.get('errors.length');
        }, 0);
        Ember.Logger.log('-- %@ control errors.'.fmt(itemDataErrorsCount));
        contentType.get('itemData').forEach(function (itemData) {
          itemData.get('errors').forEach(function (error) {
            Ember.Logger.warn('--- %@: %@'.fmt(itemData.get('name'), error));
          });
        });
      }

      validData.pushObject(contentType);

    });

    return validData;

  },

  // check each individual item
  validateItems: function (data) {

    var store = this.store,
        items = Ember.A([]);

    Ember.$.each(data || {}, function (itemId, itemData) {

      var item = Ember.Object.create({
        id: itemId,
        errors: Ember.A([])
      });

      item.set('data', itemData);

      items.pushObject(item);

    });

    return items;

  },

  validateSettingsData: function (data) {

    var validSettings = Ember.Object.create();

    validSettings.setProperties(data);

    return validSettings;

  },

  isValidData: function () {
    return true;
  }.property(),

  importContentTypes: function () {

    Ember.Logger.log('%cImporting content types.', 'color: green; font-weight: bold');

    var store = this.store;

    // only import content types with valid data.
    var validTypes = this.get('importData.contentTypes').filterBy('data');

    // find existing content types, and remove them
    var deletePromises = validTypes.getEach('id').map(function (contentTypeId) {

      var existingType = store.getById('content-type', contentTypeId);

      if (Ember.isEmpty(existingType)) {
        return Ember.RSVP.Promise.resolve();
      } else {
        return existingType.destroyRecord();
      }

    });

    // add new types to firebase
    return Ember.RSVP.all(deletePromises).then(function () {

      var typeRef = window.ENV.firebase.child('contentType');

      var createPromises = validTypes.map(function (type) {
        return new Ember.RSVP.Promise(function (resolve, reject) {
          typeRef.child(type.get('id')).set(type.get('data'), function (error) {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });
      });

      return Ember.RSVP.all(createPromises);

    }).then(function () {
      Ember.Logger.log('%cContent types import complete.', 'color: green; font-weight: bold');
    });
  },

  importItemData: function () {

    Ember.Logger.log('%cImporting item data.', 'color: green; font-weight: bold');

    var store = this.store;

    var validTypes = this.get('importData.data').filter(function (type) {
      var oneOff = type.get('oneOff');
      var items = type.get('items');
      return (!oneOff && items.get('length')) || (oneOff && !Ember.isEmpty(items));
    });

    // insert new data
    var createPromises = Ember.A([]);

    validTypes.forEach(function (type) {

      if (type.get('oneOff')) {

        store.find('data', type.get('id')).then(function (item) {
          return item;
        }, function () {
          var item = store.getById('data', type.get('id'));
          if (Ember.isEmpty(item)) {
            return store.createRecord('data', {
              id: type.get('id')
            });
          } else {
            item.loadedData();
            return item;
          }
        }).then(function (item) {
          item.set('itemData', type.get('items.data'));
          createPromises.pushObject(item.save());
        });

      } else {

        type.get('items').forEach(function (importItem) {

          store.find(type.get('id'), importItem.get('id')).then(function (item) {
            window.console.log('found item', item.get('id'));
            return item;
          }, function () {
            var item = store.getById(type.get('id'), importItem.get('id'));
            if (Ember.isEmpty(item)) {
              return store.createRecord(type.get('id'), {
                id: importItem.get('id')
              });
            } else {
              item.loadedData();
              return item;
            }
          }).then(function (item) {
            item.set('itemData', importItem.get('data'));
            createPromises.pushObject(item.save());
          });

        });

      }

    });

    return Ember.RSVP.Promise.all(createPromises).then(function () {
      Ember.Logger.log('%cItem data import complete.', 'color: green; font-weight: bold');
    });

  },

  importSettings: function () {

    Ember.Logger.log('%cImporting settings.', 'color: green; font-weight: bold');

  },

  readFile: function (file) {

    var controller = this;
    var data = null;

    controller.set('importData', null);
    controller.set('importDataError', null);

    var reader = new window.FileReader();

    reader.onload = function (e) {
      try {
        data = JSON.parse(reader.result);
      } catch (error) {
        Ember.Logger.error(error);
        controller.set('importDataError', error);
      }

      controller.validateData(data);

    };

    reader.readAsText(file);

  },

  actions: {
    selectFile: function (file) {
      this.readFile(file);
    },

    clearData: function () {
      this.set('importData', null);
      this.set('importDataError', null);
    },

    importData: function () {
      this.importContentTypes().then(this.importItemData.bind(this)).then(this.importSettings.bind(this));
    },

    // for mike's testing sanity
    runTestData: function (type) {
      this.validateData(JSON.parse(window.localStorage.getItem('testImportData:%@'.fmt(type))));
      // this.send('importData');
    }
  }

});
