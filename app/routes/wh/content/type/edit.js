import getItemModelName from 'appkit/utils/model';

export default Ember.Route.extend({
  beforeModel: function (transition) {

    var promises = [];

    var itemId = transition.params['wh.content.type.edit'] && transition.params['wh.content.type.edit'].item_id;

    if (itemId) {
      var lockKey = 'presence/locked/' + getItemModelName(this.modelFor('wh.content.type')) + ':' + itemId;
      var lockRef = window.ENV.firebase.child(lockKey);

      promises.push(new Ember.RSVP.Promise(function (resolve, reject) {
        lockRef.on('value', function (snapshot) {
          if (snapshot.val()) {
            reject(new Ember.Error(snapshot.val()));
          } else {
            resolve();
          }
        });
      }));

      this.set('lockRef', lockRef);
    }

    // need to make sure all the content types are in the store
    // basically a hack
    promises.push(this.store.find('control-type'));

    // make sure `create_date`, `last_updated` and `publish_date` controls exist
    promises.push(this.fixControlType(this.modelFor('wh.content.type')));

    return Ember.RSVP.Promise.all(promises).catch(function (error) {
      window.alert(error.message + ' is already editing this item.');
      transition.abort();

      if (transition.urlMethod === 'replaceQuery') {
        this.transitionTo('wh');
      }
      // return Ember.RSVP.reject(error);
    }.bind(this));
  },
  model: function (params) {
    this.set('modelId', params.item_id);
    return this.modelFor('wh.content.type');
  },
  afterModel: function (model) {

    // Lock it down!
    this.get('lockRef').set(this.get('session.user.email'));

    // Unlock on disconnect
    this.get('lockRef').onDisconnect().remove();

    if (this.get('modelId')) {
      return this.store.find(getItemModelName(model), this.get('modelId')).then(function (item) {
        this.fixItem(item);
        this.set('itemModel', item);
      }.bind(this));
    }
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

      if (!value && control.get('controlType.valueType') === 'object') {
        value = {};
      }

      control.set('value', value);
    });

    controller.set('publishDate', type.get('controls').findBy('name', 'publish_date').get('value'));
    controller.set('isDraft', data.isDraft || !controller.get('publishDate'));

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
