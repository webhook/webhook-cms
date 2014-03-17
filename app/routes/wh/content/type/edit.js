import getItemModelName from 'appkit/utils/model';

export default Ember.Route.extend({
  beforeModel: function (transition) {

    var promises = [];

    var itemId = transition.params['wh.content.type.edit'] && transition.params['wh.content.type.edit'].item_id;

    if (itemId) {
      var contentType = this.modelFor('wh.content.type');
      var modelName = getItemModelName(contentType),
          lockRef   = window.ENV.firebase.child('presence/locked').child(modelName).child(itemId);

      var userEmail = this.get('session.user.email');

      var lockCheck = new Ember.RSVP.Promise(function (resolve, reject) {
        lockRef.once('value', function (snapshot) {
          if (snapshot.val() && snapshot.val() !== userEmail) {
            Ember.run(null, reject, new Ember.Error(snapshot.val() + ' is already editing this item.'));
          } else {
            Ember.run(null, resolve);
          }
        });
      }).then(function () {

        // Lock it down!
        lockRef.set(this.get('session.user.email'));

        // Unlock on disconnect
        lockRef.onDisconnect().remove();

        return this.store.find(modelName, itemId).then(function (item) {

          // item found
          this.fixItem(item);
          this.set('itemModel', item);

        }.bind(this), function (message) {

          // item does not exist

          // create the item if we're a one-off
          if (this.modelFor('wh.content.type').get('oneOff')) {

            // hack to overwrite empty state model that is being put in store from find method
            this.store.push(modelName, {
              id  : contentType.get('id'),
              data: { name: "" }
            });

            // use the item we just put in the store
            var item = this.store.getById(modelName, contentType.get('id'));

            this.fixItem(item);
            this.set('itemModel', item);

            return Ember.RSVP.resolve(item);

          } else {

            lockRef.remove();
            return Ember.RSVP.reject(new Ember.Error(itemId + ' does not exist.'));

          }

        }.bind(this));

      }.bind(this));

      promises.push(lockCheck);

      this.set('lockRef', lockRef);
      this.set('itemId', itemId);

    }

    // need to make sure all the content types are in the store
    // basically a hack
    promises.push(this.store.find('control-type'));

    // make sure `create_date`, `last_updated` and `publish_date` controls exist
    promises.push(this.fixControlType(this.modelFor('wh.content.type')));

    return Ember.RSVP.Promise.all(promises).catch(function (error) {
      window.alert(error.message);
      transition.abort();

      // The user entered this URL into the browser. We need to redirect them somewhere.
      if (transition.urlMethod === 'replaceQuery') {
        this.transitionTo('wh');
      }
    }.bind(this));
  },
  model: function (params) {
    return this.modelFor('wh.content.type');
  },
  setupController: function (controller, type) {

    controller.set('showSchedule', false);
    controller.set('itemModel', this.get('itemModel'));

    var data = this.getWithDefault('itemModel.data', {});

    type.get('controls').forEach(function (control) {

      control.set('widgetIsValid', true);
      control.set('widgetErrors', Ember.A([]));

      var value = data[control.get('name')];

      if (value && control.get('controlType.widget') === 'checkbox') {
        control.get('meta.data.options').forEach(function (option) {
          option.value = value.findBy('label', option.label).value;
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
          control.get('meta.data.options').forEach(function () {
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

    controller.set('lastUpdated', type.get('controls').findBy('name', 'last_updated').get('value'));
    controller.set('createDate', type.get('controls').findBy('name', 'create_date').get('value'));

    controller.set('type', type);

    this._super.apply(this, arguments);
  },

  fixControlType: function (contentType) {

    return this.store.find('control-type', 'datetime').then(function (controlType) {

      var datetimeDefaults = {
        controlType: controlType,
        locked     : true,
        showInCms  : true,
        required   : true,
        hidden     : true
      };

      var controls = contentType.get('controls'),
          save = false;

      var addControl = function (data) {
        controls.pushObject(this.store.createRecord('control', Ember.$.extend({}, datetimeDefaults, data)));
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

      if (save) {
        contentType.save();
      }

    }.bind(this));
  },

  fixItem: function (item) {
    if (!item.get('data').create_date) {
      item.get('data').create_date = moment().format('YYYY-MM-DDTHH:mm');
    }
  },

  actions: {
    willTransition: function () {
      // Unlock on transition
      if (this.get('lockRef')) {
        this.get('lockRef').remove();
      }
    }
  }
});
