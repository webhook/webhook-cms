import validateControl from 'appkit/utils/validators';

export default Ember.ObjectController.extend(Ember.Evented, {
  controlTypeGroups: null,
  editingControl   : null,
  isEditing        : false,

  // nameChange: function () {

  //   var names = this.get('controls').mapBy('name').sort(),
  //       dupes = [];

  //   for (var i = 0; i < names.length - 1; i++) {
  //     if (names[i + 1] === names[i]) {
  //       dupes.push(names[i]);
  //     }
  //   }

  //   dupes = dupes.uniq();

  //   this.get('controls').setEach('isValid', true);

  //   var invalidControls = this.get('controls').filter(function (control, index) {
  //     return dupes.indexOf(control.get('name')) >= 0;
  //   }).setEach('isValid', false);

  // }.observes('model.controls.@each.name'),

  updateOrder: function (originalindex, newindex) {

    var controls = this.get('model.controls'),
        control = controls.objectAt(originalindex);

    controls.removeAt(originalindex);
    controls.insertAt(newindex, control);

  },

  addControlAtIndex: function (controlTypeId, index) {
    this.store.find('control-type', controlTypeId).then(function (controlType) {
      this.addControl(controlType, index);
    }.bind(this));
  },

  addControl: function (controlType, index) {

    var controls, control;

    controls = this.get('model.controls');

    control = this.store.createRecord('control', {
      label: controlType.get('name'),
      controlType: controlType,
      showInCms: (controls.get('length') < 3)
    });

    control.set('widgetIsValid', true);

    var meta = this.store.createRecord('meta-data');

    switch (controlType.get('widget')) {
      case 'radio':
        meta.set('data', {
          options: [
            { value: 'Option 1' },
            { value: 'Option 2' }
          ]
        });
        break;
      case 'select':
        meta.set('data', {
          defaultValue: '',
          options: [
            { value: '' },
            { value: 'Option 1' }
          ]
        });
        break;
      case 'checkbox':
        meta.set('data', {
          options: [
            { label: 'Option 1' },
            { label: 'Option 2' }
          ]
        });
        break;
      case 'wysiwyg':
        meta.set('data', {
          image: true,
          link : true,
          quote: true,
          table: true,
          video: true
        });
        break;
      case 'rating':
        meta.set('data', {
          min: 0,
          max: 5,
          step: 0.5
        });
        break;
    }

    control.set('meta', meta);

    if (index) {
      controls.insertAt(index, control);
    } else {
      controls.pushObject(control);
    }

  },

  actions: {
    updateType: function () {

      this.get('model.controls').forEach(function (control) {
        // hax
        // firebase doesn't like undefined values and for some reason `_super` is
        // being added to arrays in ember with undefined value
        if (Ember.isArray(control.get('meta.data.options'))) {
          delete control.get('meta.data.options')._super;
        }
      });

      this.get('model').save().then(function () {
        if(!this.get('model.oneOff')) {
          window.ENV.sendGruntCommand('scaffolding:' + this.get('model.id'));
        }
        this.send('notify', 'success', 'Form saved!');
        this.transitionToRoute('wh.content.type.index', this.get('content'));
      }.bind(this));

    },

    addControl: function (controlType, index) {
      this.addControl.apply(this, arguments);
    },

    deleteControl: function (control) {

      control.set('justDeleted', true);

      Ember.run.later(this, function () {
        this.get('model.controls').removeObject(control);
      }, 500);

      this.set('editingControl', null);
      this.send('stopEditing');

    },

    editControl: function (control) {
      if (!control.get('meta')) {
        control.set('meta', this.store.createRecord('meta-data', { data: {}}));
      }
      this.set('editingControl', control);
      this.set('isEditing', true);
    },

    stopEditing: function () {
      this.set('isEditing', false);
    },

    startEditing: function () {
      if (!this.get('editingControl')) {
        this.set('editingControl', this.get('model.controls.firstObject'));
      }
      this.set('isEditing', true);
    },

    addOption: function (array) {
      array.pushObject({});
    },

    removeOption: function (array, option) {
      array.removeObject(option);
    },

    quitForm: function () {
      this.transitionToRoute('wh.content.all-types');
    }
  }
});
