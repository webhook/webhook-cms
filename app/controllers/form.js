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

    var allControls          = this.get('model.controls'),
        shownControls        = allControls.rejectBy('hidden'),
        control              = shownControls.objectAt(originalindex),
        originalControlIndex = allControls.indexOf(control),
        newControlIndex      = allControls.indexOf(shownControls.objectAt(newindex));

    allControls.removeAt(originalControlIndex);
    allControls.insertAt(newControlIndex, control);

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
      showInCms: (controls.filterBy('showInCms').get('length') < 3)
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

        if (control.get('controlType.widget') === 'checkbox') {
          control.get('meta.data.options').setEach('value', null);
        }

      });

      var wasNew = this.get('model.isNew');

      this.get('model').save().then(function (contentType) {

        if (contentType.get('oneOff')) {

          if (wasNew) {
            this.store.createRecord('data', {
              id  : contentType.get('id'),
              data: { name: "" }
            }).save().then(function () {
              this.transitionToRoute('wh.content.type.index', contentType);
            }.bind(this));
          } else {
            this.transitionToRoute('wh.content.type.index', contentType);
          }

          this.send('notify', 'success', 'Form saved!');

        } else {

          if (wasNew) {
            window.ENV.sendGruntCommand('scaffolding:' + contentType.get('id'), function () {
              this.send('notify', 'success', 'Scaffolding for ' + contentType.get('name') + ' built.');
            }.bind(this));
            this.transitionToRoute('wh.content.type.index', contentType);
            this.send('notify', 'success', 'Form saved!');
          } else {
            // ask if they want to rebuild scaffolding
            this.toggleProperty('scaffoldingPrompt');
          }

        }

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

      // changed your mind on a new contentType? BALEETED
      if (this.get('model.isNew')) {
        this.get('model').deleteRecord();
      }

      this.transitionToRoute('wh.content.all-types');
    },

    forceScaffolding: function () {
      window.ENV.sendGruntCommand('scaffolding_force:' + this.get('model.id'), function () {
        this.send('notify', 'success', 'Scaffolding for ' + this.get('model.name') + ' built.');
      }.bind(this));
      this.transitionToRoute('wh.content.type.index', this.get('model'));
    },

    abortScaffolding: function () {
      this.transitionToRoute('wh.content.type.index', this.get('model'));
    }
  }
});
