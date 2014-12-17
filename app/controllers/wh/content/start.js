import downcode from 'appkit/utils/downcode';

export default Ember.ArrayController.extend({
  newTypeName: null,
  newTypeType: null,

  reset: function () {
    this.setProperties({
      newTypeName: null,
      newTypeType: null
    });
  },

  isDisabled: function () {
    return this.get('isIdTooLong') || this.get('isDuplicate') || this.get('newTypeType') === null;
  }.property('isDuplicate', 'isIdTooLong', 'newTypeType'),

  isDuplicate: function () {
    return this.get('model').isAny('id', this.get('newTypeId'));
  }.property('newTypeId'),

  isIdTooLong: function () {
    return this.get('newTypeId.length') > 250;
  }.property('newTypeId'),

  newTypeId: function () {
    return downcode(this.get('newTypeName')).replace(/\s+|\W/g, '').toLowerCase();
  }.property('newTypeName'),

  actions: {
    createType: function () {

      if (this.get('isDuplicate')) {
        return;
      }

      var controller = this,
          store = this.store,
          controlPromises = Ember.A([]),
          controls = Ember.A([]);

      // Required `name` field on all items.
      var textfieldControl = store.find('control-type', 'textfield').then(function (controlType) {
        controls.pushObject(store.createRecord('control', {
          controlType: controlType,
          name       : 'name',
          label      : 'Name',
          locked     : true,
          showInCms  : true,
          required   : true
        }));
      });

      // Required/hidden `createDate`, `updateDate`, `publishDate` fields on all items.
      var datetimeControls = store.find('control-type', 'datetime').then(function (controlType) {

        var datetimeDefaults = {
          controlType: controlType,
          locked     : true,
          required   : true,
          hidden     : true
        };

        var pushDateTimeControl = function (data) {
          controls.pushObject(store.createRecord('control', Ember.$.extend({}, datetimeDefaults, data)));
        };

        pushDateTimeControl({
          name : 'create_date',
          label: 'Create Date'
        });

        pushDateTimeControl({
          name : 'last_updated',
          label: 'Last Updated'
        });

        if (controller.get('newTypeType') !== 'single') {
          pushDateTimeControl({
            name : 'publish_date',
            label: 'Publish Date',
            required: false
          });
        }

      });

      // Wait until we get all the controls and then create the content type.
      Ember.RSVP.Promise.all([textfieldControl, datetimeControls]).then(function () {

        // creating a new content-type
        var type = this.store.createRecord('content-type', {
          id  : this.get('newTypeId'),
          name: this.get('newTypeName')
        });

        if (this.get('newTypeType') === 'single') {
          type.set('oneOff', true);
        }

        type.get('controls').pushObjects(controls);

        this.transitionToRoute('form', type);

        this.reset();

      }.bind(this));

    }
  }
});
