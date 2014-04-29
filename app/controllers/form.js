import validateControl from 'appkit/utils/validators';

export default Ember.ObjectController.extend(Ember.Evented, {
  controlTypeGroups: null,
  editingControl   : null,
  isEditing        : false,
  contentTypes     : null,
  relationTypes    : null,
  addedControls    : Ember.A([]),
  removedControls  : Ember.A([]),
  changedControls  : Ember.A([]),

  validateControls: function () {

    this.get('controls').setEach('widgetIsValid', true);
    this.get('controls').setEach('widgetErrors', Ember.A([]));

    var names = this.get('controls').mapBy('name').sort(),
        dupes = [];

    for (var i = 0; i < names.length - 1; i++) {
      if (names[i + 1] === names[i]) {
        dupes.push(names[i]);
      }
    }

    dupes = dupes.uniq();

    this.get('controls').filter(function (control, index) {
      return dupes.indexOf(control.get('name')) >= 0;
    }).setEach('widgetIsValid', false);

    this.get('controls').rejectBy('widgetIsValid').setEach('widgetErrors', Ember.A(['Duplicate name.']));

    this.get('controls').filterBy('controlType.widget', 'relation').forEach(function (control) {
      if (!control.get('meta.data.contentTypeId')) {
        control.set('widgetIsValid', false);
        control.get('widgetErrors').addObject('You must select a related content type.');
      }
    });

  },

  updateOrder: function (originalIndex, newIndex) {

    var controls = this.get('model.controls'),
        control  = controls.objectAt(originalIndex);

    controls.removeAt(originalIndex);
    controls.insertAt(newIndex, control);

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
      label      : controlType.get('name'),
      controlType: controlType,
      showInCms  : (controls.filterBy('showInCms').get('length') < 3)
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
      case 'tabular':
        meta.set('data', {
          options: [
            { value: 'Column 1' },
            { value: 'Column 2' }
          ]
        });
        var value = Ember.A([]);
        var emptyRow = Ember.A([]);
        meta.get('data.options').forEach(function () {
          emptyRow.pushObject("");
        });
        value.pushObject(emptyRow);
        control.set('value', value);
        break;

      case 'relation':
        meta.set('data', {
          contentTypeId: null
        });
        break;
    }

    control.set('meta', meta);

    if (index) {
      controls.insertAt(index, control);
    } else {
      controls.pushObject(control);
    }

    this.get('addedControls').addObject(control);

  },

  controlChanged: function (control) {
    this.get('changedControls').addObject(control);
  },

  updateRelations: function () {

    Ember.Logger.info('Looking for relationships to update.');

    // Store relation promises here
    var relationUpdates = Ember.A([]);

    var removedRelations = this.get('removedControls').filterBy('controlType.widget', 'relation');

    Ember.Logger.info('Need to remove ' + removedRelations.get('length') + ' reverse relationships.');

    removedRelations.forEach(function (control) {
      Ember.Logger.info('Attempting to remove `' + control.get('meta.data.reverseName') + '` from `' + control.get('meta.data.contentTypeId') + '`');
      var relationPromise = new Ember.RSVP.Promise(function (resolve, reject) {
        this.get('store').find('contentType', control.get('meta.data.contentTypeId')).then(function (contentType) {
          var controls = contentType.get('controls');
          var controlToRemove = controls.filterBy('name', control.get('meta.data.reverseName')).get('firstObject');
          controls.removeObject(controlToRemove);
          contentType.save().then(function () {
            Ember.Logger.info('Successfully removed `' + control.get('meta.data.reverseName') + '` from `' + control.get('meta.data.contentTypeId') + '`');
            Ember.run(null, resolve);
          }, function (error) {
            Ember.run(null, reject, error);
          });
        }, function (error) {
          Ember.run(null, reject, error);
        });
      }.bind(this));
      relationUpdates.push(relationPromise);
    }.bind(this));



    var addedRelations = this.get('addedControls').filterBy('controlType.widget', 'relation');

    Ember.Logger.info('Need to add ' + addedRelations.get('length') + ' reverse relationships.');

    addedRelations.forEach(function (localControl) {

      Ember.Logger.info('Attempting to add reverse relationship of `' + localControl.get('name') + '` to `' + localControl.get('meta.data.contentTypeId') + '`');

      var relationPromise = new Ember.RSVP.Promise(function (resolve, reject) {

        this.get('store').find('contentType', localControl.get('meta.data.contentTypeId')).then(function (contentType) {

          var foreignControls = contentType.get('controls');
          var foreignRelations = foreignControls.filterBy('controlType.widget', 'relation');

          this.store.find('control-type', 'relation').then(function (controlType) {

            var control = this.store.createRecord('control', {
              label      : this.get('model.name'),
              controlType: controlType,
              meta: this.store.createRecord('meta-data', {
                data: {
                  contentTypeId: this.get('model.id'),
                  reverseName: localControl.get('name')
                }
              })
            });

            // The new reverse relation control must have a unique name
            var counter = 1;
            while (foreignControls.getEach('name').indexOf(control.get('name')) >= 0) {
              counter = counter + 1;
              control.set('label', this.get('model.name') + ' ' + counter);
            }

            Ember.Logger.info('Setting unique name for reverse relationship: `' + control.get('name') + '` on `' + contentType.get('id') + '`');

            // Remember reverse relation name in meta data
            localControl.set('meta.data.reverseName', control.get('name'));

            // Add new relation control to the stack
            contentType.get('controls').pushObject(control);

            contentType.save().then(function (contentType) {
              Ember.Logger.info('Reverse relationship of `' + localControl.get('name') + '` to `' + localControl.get('meta.data.contentTypeId') + '` successfully added.');
              Ember.run(null, resolve);
            }, function (error) {
              Ember.run(null, reject, error);
            });

          }.bind(this));

        }.bind(this));

      }.bind(this));

      relationUpdates.push(relationPromise);

    }.bind(this));


    var changedRelations = this.get('changedControls').filterBy('controlType.widget', 'relation');

    Ember.Logger.info('Need to update ' + changedRelations.get('length') + ' reverse relationships.');

    changedRelations.forEach(function (localControl) {

      Ember.Logger.info('Attempting to update reverse relationship of `' + localControl.get('name') + '` to `' + localControl.get('meta.data.contentTypeId') + '`');

      var relationPromise = new Ember.RSVP.Promise(function (resolve, reject) {
        this.get('store').find('contentType', localControl.get('meta.data.contentTypeId')).then(function (contentType) {

          var foreignControls = contentType.get('controls');
          var foreignRelations = foreignControls.filterBy('controlType.widget', 'relation');

          foreignControls.filterBy('name', localControl.get('meta.data.reverseName')).setEach('meta.data.reverseName', localControl.get('name'));

          contentType.save().then(function (contentType) {
            Ember.Logger.info('`' + contentType.get('name') + '` updated.');
            Ember.run(null, resolve);
          });
        }.bind(this));

      }.bind(this));

    }.bind(this));

    return relationUpdates;
  },

  actions: {
    updateType: function () {

      this.set('isEditing', false);

      this.validateControls();

      if (this.get('model.controls').isAny('widgetIsValid', false)) {
        return;
      }

      this.get('model.controls').forEach(function (control) {

        // we don't want to store checkbox values to the db when we save
        if (control.get('controlType.widget') === 'checkbox') {
          control.get('meta.data.options').setEach('value', null);
        }

        // hax
        // firebase doesn't like undefined values and for some reason `_super` is
        // being added to arrays in ember with undefined value
        if (Ember.isArray(control.get('meta.data.options'))) {
          control.set('meta.data.options', control.get('meta.data.options').toArray());
          Ember.run.sync();
          delete control.get('meta.data.options').__nextSuper;
        }

      });

      var wasNew = this.get('model.isNew');

      // update relationships
      // check if we changes relationship widget names
      var relationUpdates = this.updateRelations();

      // When all the relationships are updated, save this contentType.
      Ember.RSVP.Promise.all(relationUpdates).then(function () {

        Ember.Logger.info('Saving contentType `' + this.get('model.name') + '`');

        this.get('model').save().then(function (contentType) {

          if (contentType.get('oneOff')) {

            this.transitionToRoute('wh.content.type.index', contentType);
            this.send('notify', 'success', 'Form saved!');

          } else {

            if (wasNew) {
              window.ENV.sendGruntCommand('scaffolding:' + contentType.get('id'), function () {
                this.send('notify', 'success', 'Scaffolding for ' + contentType.get('name') + ' built.');
              }.bind(this));
              // Acknowledge scaffolding
              this.toggleProperty('initialScaffoldingPrompt');
            } else {
              // ask if they want to rebuild scaffolding
              this.toggleProperty('scaffoldingPrompt');
            }

          }

        }.bind(this), function (error) {
          Ember.Logger.error(error);
          if (window.trackJs) {
            window.trackJs.log("Attempted to save form.", this.get('model'));
            window.trackJs.track(error);
          }
          this.send('notify', 'danger', 'There was an error while saving.');
        }.bind(this));

      }.bind(this));

    },

    addControl: function (controlType, index) {
      this.addControl.apply(this, arguments);
    },

    deleteControl: function (control) {

      if (this.get('addedControls').indexOf(control) >= 0) {
        this.get('addedControls').removeObject(control);
      } else {
        this.get('removedControls').addObject(control);
      }

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
      var control = this.get('editingControl');
      if (control.get('controlType.widget') === 'tabular') {
        control.get('value').forEach(function (row) {
          row.pushObject("");
        });
      }
    },

    removeOption: function (array, option) {
      var control = this.get('editingControl');
      if (control.get('controlType.widget') === 'tabular') {
        var optionIndex = array.indexOf(option);
        control.get('value').forEach(function (row) {
          row.removeAt(optionIndex);
        });
      }
      array.removeObject(option);
    },

    quitForm: function () {

      // changed your mind on a new contentType? BALEETED
      if (this.get('model.isNew')) {
        this.get('model').deleteRecord();
      }

      this.transitionToRoute('wh.content.all-types');
    },

    acknoledgeScaffolding: function () {
      this.transitionToRoute('wh.content.type.index', this.get('model'));
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
