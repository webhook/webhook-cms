import getItemModelName from 'appkit/utils/model';
import SearchIndex from 'appkit/utils/search-index';

export default Ember.Route.extend({

  beforeModel: function (transition) {

    var EditRoute = this;
    var contentType = this.modelFor('wh.content.type');
    var promises = [];

    // need to make sure all the content types are in the store
    // basically a hack
    promises.push(this.store.find('control-type'));

    // add missing controls that the generator requires
    promises.push(this.fixContentType(contentType));

    var itemId = transition.params['wh.content.type.edit'] && transition.params['wh.content.type.edit'].item_id;

    if (itemId) {
      var modelName = getItemModelName(contentType);

      var editingRef = window.ENV.firebase.child('presence/editing').child(modelName).child(itemId);

      var editorRef = editingRef.child(this.get('session.user.uid'));
      editorRef.onDisconnect().remove();
      editorRef.set(this.get('session.user.email'));
      this.set('editorRef', editorRef);

      var draftRef = window.ENV.firebase.child('draft').child(modelName).child(itemId);
      this.set('draftRef', draftRef);

      var itemPromise = this.store.find(modelName, itemId).catch(function () {

        // item does not exist

        // create the item if we're a one-off
        if (EditRoute.modelFor('wh.content.type').get('oneOff')) {

          // hack to overwrite empty state model that is being put in store from find method
          EditRoute.store.push(modelName, {
            id  : contentType.get('id'),
            itemData: { name: "" }
          });

          // use the item we just put in the store
          var item = EditRoute.store.getById(modelName, contentType.get('id'));

          EditRoute.set('itemModel', item);

          return Ember.RSVP.resolve(item);

        } else {

          return Ember.RSVP.reject(new Ember.Error('%@ does not exist.'.fmt(itemId)));

        }

      }).then(function (item) {

        EditRoute.set('itemModel', item);

        return new Ember.RSVP.Promise(function (resolve, reject) {
          draftRef.once('value', function (snapshot) {
            if (snapshot.val()) {
              return resolve(snapshot.val());
            } else {
              return resolve(item.getWithDefault('itemData', {}));
            }
          });
        });

      }).then(function (itemData) {
        EditRoute.set('itemData', itemData);
      });

      promises.push(itemPromise);
      this.set('itemId', itemId);

    }

    return Ember.RSVP.Promise.all(promises);

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
    var draftRef = this.get('draftRef');

    this.set('dupeNameError', 'Name must be unique among ' + type.get('name') + ' entries.');

    controller.set('showSchedule', false);
    controller.set('itemModel', this.get('itemModel'));
    controller.set('initialRelations', Ember.Object.create());

    controller.set('draftRef', this.get('draftRef'));

    var data = this.get('itemData');

    type.get('controls').forEach(function (control) {

      control.set('widgetIsValid', true);
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
        if (!Ember.isArray(value)) {
          value = Ember.A([value]);
        }
        // Remember what the initial relations are so we can check for diffs on save.
        controller.get('initialRelations').set(control.get('name'), Ember.copy(value));
      }

      if (!value && control.get('controlType.valueType') === 'object') {
        value = {};
      }

      control.set('value', value);

      control.set('draftValue', Ember.A([]));

      // Drafts
      function setDraftValue () {
        var draftValue = control.getWithDefault('correctedValue');
        control.get('draftValue').pushObject(draftValue);
        draftRef.child(control.get('name')).set(draftValue);
      }

      setDraftValue();

      control.addObserver('value', setDraftValue);

    });

    var updateControl = function (snapshot) {
      var control = type.get('controls').findBy('name', snapshot.name());
      var draftValue = snapshot.val();

      if (~control.get('draftValue').indexOf(draftValue)) {
        control.get('draftValue').removeObject(draftValue);
      } else {
        control.set('value', snapshot.val());
      }

    };

    draftRef.on('child_added', updateControl);
    draftRef.on('child_removed', updateControl);
    draftRef.on('child_changed', updateControl);

    controller.set('publishDate', type.get('controls').findBy('name', 'publish_date').get('value'));

    if (type.get('oneOff')) {
      controller.set('isDraft', null);
    } else {
      controller.set('isDraft', data.isDraft || !controller.get('publishDate'));
    }

    controller.set('lastUpdated', type.get('controls').findBy('name', 'last_updated').get('value'));
    controller.set('createDate', type.get('controls').findBy('name', 'create_date').get('value'));

    controller.set('type', type);

    controller.set('previewUrl', null);

    // watch for value changes so we can prevent user from accidentally leaving
    controller.set('initialValues', type.get('controls').getEach('value'));
  },

  fixContentType: function (contentType) {

    var route = this;

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
      controls.pushObject(route.store.createRecord('control', Ember.$.extend({}, datetimeDefaults, data)));
      save = true;
    };

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
      return contentType.save();
    } else {
      return Ember.RSVP.Promise.resolve();
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

      this.get('controller.type.controls').filterBy('name', 'name').forEach(function (control) {
        control.removeObserver('value');
      });
      this.set('isObservingName', false);

      if (this.get('editorRef')) {
        this.get('editorRef').remove();
      }

      if (this.get('draftRef')) {
        this.get('draftRef').off();
      }

      return true;
    }
  }
});
