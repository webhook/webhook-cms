import SearchIndex from 'appkit/utils/search-index';

export default Ember.Route.extend({

  beforeModel: function (transition) {

    var EditRoute = this;
    var promises = [];

    var itemId = transition.params['wh.content.type.edit'] && transition.params['wh.content.type.edit'].item_id;

    var contentType = this.modelFor('wh.content.type');
    var modelName = contentType.get('itemModelName');

    if (itemId) {
      var lockRef   = window.ENV.firebase.child('presence/locked').child(modelName).child(itemId);

      var userEmail = this.get('session.user.email');

      var lockCheck = new Ember.RSVP.Promise(function (resolve, reject) {
        lockRef.once('value', function (snapshot) {
          var lock = snapshot.val();
          Ember.Logger.log('lockCheck done');
          if (lock && typeof lock === 'object' && lock.email !== userEmail) {
            // check for expired lock
            if (moment(lock.time).diff(moment()) > 0) {
              reject(new Ember.Error(lock.email + ' is already editing this item.'));
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        });
      }).then(function () {

        // Unlock on disconnect
        lockRef.onDisconnect().remove();

        EditRoute.addObserver('lockUntil', EditRoute.updateLock);

        EditRoute.set('lockUntil', moment().add(2, 'minutes').format());

        return EditRoute.store.find(modelName, itemId).then(function (item) {

          // item found
          EditRoute.set('itemModel', item);

        }, function (message) {

          // item does not exist

          // create the item if we're a one-off
          if (EditRoute.modelFor('wh.content.type').get('oneOff')) {

            // hack to overwrite empty state model that is being put in store from find method
            var item = EditRoute.store.getById(modelName, contentType.get('id'));
            item.loadedData();

            EditRoute.set('itemModel', item);

            return Ember.RSVP.resolve(item);

          } else {

            lockRef.remove();
            return Ember.RSVP.reject(new Ember.Error(itemId + ' does not exist.'));

          }

        });

      });

      promises.push(lockCheck);

      this.set('lockRef', lockRef);
      this.set('itemId', itemId);

    }

    // make sure `create_date`, `last_updated` and `publish_date` controls exist
    promises.push(this.fixControlType(this.modelFor('wh.content.type')));

    return Ember.RSVP.Promise.all(promises).catch(function (error) {
      window.alert(error.message);
      var contentType = this.modelFor('wh.content.type');
      if (contentType.get('oneOff')) {
        this.transitionTo('wh');
      } else {
        this.transitionTo('wh.content.type', contentType);
      }
    }.bind(this));
  },

  updateLock: function () {

    var lockUntil = this.get('lockUntil');

    if (Ember.isEmpty(lockUntil)) {
      return;
    }

    this.get('lockRef').set({
      email: this.get('session.user.email'),
      time: lockUntil
    });

    var EditRoute = this;
    var incrementLockTime = Ember.run.later(function () {
      EditRoute.set('lockUntil', moment().add(2, 'minutes').format());
    }, 60000);

    this.set('incrementLockTime', incrementLockTime);

  },

  model: function (params) {
    return this.modelFor('wh.content.type');
  },

  searchName: function () {

    var route = this;
    var type = this.get('context');
    var control = type.get('controls').filterBy('name', 'name').get('firstObject');
    var itemName = control.get('value');

    if (!itemName) {
      return;
    }

    var item = this.get('itemModel');

    SearchIndex.search(itemName, 1, type.get('id')).then(function (results) {
      results.forEach(function (result) {
        if ((Ember.isNone(item) || (item && item.get('id') !== result.id)) && itemName.toLowerCase() === Ember.$('<span>').html(result.name).text().toLowerCase()) {
          control.set('widgetIsValid', false);
          control.get('widgetErrors').pushObject(route.get('dupeNameError'));
        }
      });
    });

  },

  dupeNameCheck: function () {

    var type = this.get('context');
    var control = type.get('controls').filterBy('name', 'name').get('firstObject');

    if (this.get('isObservingName')) {
      control.get('widgetErrors').removeObjects([
        'This field is required',
        this.get('dupeNameError')
      ]);
      if (!control.get('widgetErrors.length')) {
        control.set('widgetIsValid', true);
      }

      Ember.run.debounce(this, this.searchName, 1000);

    } else {

      this.set('isObservingName', true);

    }
  },

  setupController: function (controller, type) {

    this._super.apply(this, arguments);

    var route = this;

    this.set('dupeNameError', 'Name must be unique among ' + type.get('name') + ' entries.');

    controller.set('showSchedule', false);
    controller.set('itemModel', this.get('itemModel'));
    controller.set('isNew', !this.get('itemId'));
    controller.set('initialRelations', Ember.Object.create());

    var data = this.getWithDefault('itemModel.itemData', {});

    type.get('controls').forEach(function (control) {

      control.set('widgetErrors', Ember.A([]));

      var value = data[control.get('name')];

      // Use search to check for duplicate names
      if (control.get('name') === 'name') {
        control.addObserver('value', route.dupeNameCheck.bind(route));
        controller.set('nameControl', control);
      }

      if (control.get('name') === 'slug') {
        controller.set('slugControl', control);
        controller.set('isEditingSlug', false);
      }

      if (control.get('controlType.widget') === 'checkbox') {
        control.get('meta.options').forEach(function (option) {
          if (value && value.findBy('label', option.label)) {
            option.value = value.findBy('label', option.label).value;
          }
        });
      }

      if (['image', 'audio', 'file'].indexOf(control.get('controlType.widget')) >= 0) {
        value = Ember.Object.create(value || {});
      }

      // remove offset so datetime input can display
      if (value && control.get('controlType.widget') === 'datetime') {
        value = moment(value).format('YYYY-MM-DDTHH:mm');
      }

      if (control.get('controlType.widget') === 'tabular') {
        if (!value) {
          value = Ember.A([]);
          var emptyRow = Ember.A([]);
          control.get('meta.options').forEach(function () {
            emptyRow.pushObject("");
          });
          value.pushObject(emptyRow);
        } else {
          // we must convert data into mutable form
          var mutableValue = Ember.A([]);
          value.forEach(function (row) {
            var mutableData = Ember.A([]);
            row.forEach(function (data) {
              mutableData.pushObject({
                value: data
              });
            });
            mutableValue.pushObject(mutableData);
          });
          value = mutableValue;
        }
      }

      if (value && control.get('controlType.widget') === 'relation') {
        if (value && !Ember.isArray(value)) {
          value = Ember.A([value]);
        }
        // Remember what the initial relations are so we can check for diffs on save.
        controller.get('initialRelations').set(control.get('name'), Ember.copy(value));
      }

      if (!value && control.get('controlType.valueType') === 'object') {
        value = {};
      }

      control.set('value', value);
    });

    controller.set('publishDate', type.get('controls').findBy('name', 'publish_date').get('value'));

    if (type.get('oneOff')) {
      controller.set('isDraft', null);
    } else {
      controller.set('isDraft', data.isDraft || !controller.get('publishDate'));
    }

    controller.set('type', type);

    controller.set('previewUrl', null);

    // watch for value changes so we can prevent user from accidentally leaving
    controller.set('initialValues', type.get('controls').getEach('value'));
  },

  fixControlType: function (contentType) {

    var datetimeDefaults = {
      controlType: this.store.getById('control-type', 'datetime'),
      locked     : true,
      showInCms  : true,
      required   : true,
      hidden     : true
    };

    var controls = contentType.get('controls'),
        save = false;

    var addControl = function (data) {
      var control = this.store.createRecord('control', Ember.$.extend({}, datetimeDefaults, data));
      control.set('widgetIsValid', true);
      controls.pushObject(control);
      save = true;
    }.bind(this);

    if (!controls.isAny('name', 'create_date')) {
      addControl({
        name : 'create_date',
        label: 'Create Date'
      });
    }

    if (!controls.isAny('name', 'last_updated')) {
      addControl({
        name : 'last_updated',
        label: 'Last Updated'
      });
    }

    if (!controls.isAny('name', 'publish_date')) {
      addControl({
        name : 'publish_date',
        label: 'Publish Date',
        required: false
      });
    }

    if (!controls.isAny('name', 'preview_url')) {
      addControl({
        controlType: this.store.getById('control-type', 'textfield'),
        name       : 'preview_url',
        label      : 'Preview URL',
        showInCms  : false
      });
    }

    if (!controls.isAny('name', 'slug')) {
      addControl({
        controlType: this.store.getById('control-type', 'textfield'),
        name       : 'slug',
        label      : 'Slug',
        showInCms  : false,
        required   : false
      });
    }

    if (save) {
      contentType.save();
    }

  },

  actions: {
    willTransition: function (transition) {

      if (this.get('controller.isDirty') && !window.confirm('You have changes that have not been saved, are you sure you would like to leave?')) {
        transition.abort();
        return;
      }

      this.get('controller').removeObserver('type.controls.@each.value');
      this.set('controller.isDirty', false);

      this.get('controller.type.controls').findBy('name', 'name').removeObserver('value');
      this.set('isObservingName', false);


      // Unlock on transition
      this.removeObserver('lockUntil', this.updateLock);
      this.set('lockUntil', null);
      if (this.get('lockRef')) {
        this.get('lockRef').remove();
      }

      return true;
    }
  }
});
