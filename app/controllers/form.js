import validateControl from 'appkit/utils/validators';
import getItemModelName from 'appkit/utils/model';
import SearchIndex from 'appkit/utils/search-index';
import downcode from 'appkit/utils/downcode';

export default Ember.ObjectController.extend(Ember.Evented, {
  controlTypeGroups: null,
  editingControl   : null,
  isEditing        : false,
  contentTypes     : null,
  relationTypes    : null,

  addedControls       : Ember.A([]),
  removedControls     : Ember.A([]),
  changedNameControls : Ember.A([]),
  changedRadioControls: Ember.A([]),

  removedControlsApproved     : null,
  changedControlNamessApproved: null,

  isEditingTypeId: false,
  newTypeIdErrors: Ember.A([]),

  isValidTypeId: function () {

    var valid = true;
    this.set('newTypeIdErrors', Ember.A([]));

    if (Ember.isEmpty(this.get('newTypeId'))) {
      this.get('newTypeIdErrors').push('Content type name cannot be empty.');
      return false;
    }

    if (this.get('id') !== this.get('newTypeId') && this.get('contentTypes').isAny('id', this.get('newTypeId'))) {
      valid = false;
      this.get('newTypeIdErrors').push('There is already a content type with this generated ID (' + this.get('newTypeId') + ').');
    }

    if (this.get('newTypeId.length') > 250) {
      valid = false;
      this.get('newTypeIdErrors').push('The generated ID is too long. It must be 250 characters or shorter.');
    }

    return valid;
  }.property('newTypeId'),

  isNewTypeId: function () {
    return this.get('newTypeId') !== this.get('model.id');
  }.property('newTypeId'),

  newTypeId: function () {
    return downcode(this.get('model.name')).replace(/\s+|\W/g, '').toLowerCase();
  }.property('model.name'),

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
      case 'instruction':
        control.set('showInCms', false);
        break;
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

            var capitalizedModelName = this.get('model.name').charAt(0).toUpperCase() + this.get('model.name').slice(1);
            var controlLabel = capitalizedModelName + ' (' + localControl.get('label') + ')';

            var control = this.store.createRecord('control', {
              label      : controlLabel,
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
              control.set('label', controlLabel + ' ' + counter);
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

    var changedRelations = this.get('changedNameControls').filterBy('controlType.widget', 'relation');

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

  updateItems: function () {

    // if the content type is new, we do not need to do anything
    if (this.get('model.isNew')) {
      return;
    }

    var changedNameControls = this.get('changedNameControls');
    var removedControls = this.get('removedControls');
    var changedRadioControls = this.get('changedRadioControls');
    var contentType = this.get('model');

    // if we didn't remove controls or change control names we do not need to update anything
    if (!removedControls.get('length') && !changedNameControls.get('length') && !changedRadioControls.get('length')) {
      Ember.Logger.info('Item updates not needed');
      return;
    }

    var itemModelName = getItemModelName(contentType);

    Ember.Logger.info('Updating `' + itemModelName + '` item data and search indices for', removedControls.get('length'), 'removed controls,', changedNameControls.get('length'), 'renamed controls, and', changedRadioControls.get('length'), 'changed radio controls.');

    var updateData = function (item) {
      var itemData = item.get('data');

      changedNameControls.forEach(function (control) {
        itemData[control.get('name')] = itemData[control.get('originalName')] === undefined ? null : itemData[control.get('originalName')];
        itemData[control.get('originalName')] = null;
      });

      removedControls.forEach(function (control) {
        itemData[control.get('originalName')] = null;
      });

      changedRadioControls.forEach(function (control) {
        if (itemData[control.get('name')]) {
          itemData[control.get('name')] = control.get('values').get(itemData[control.get('name')]) ? control.get('values').get(itemData[control.get('name')]) : itemData[control.get('name')];
        }
      });

      item.set('data', itemData);
      item.save().then(function (savedItem) {
        Ember.Logger.info('Data updates applied to', savedItem.get('id'));
        SearchIndex.indexItem(savedItem, contentType);
      });
    };

    if (contentType.get('oneOff')) {
      this.store.find(itemModelName, contentType.get('id')).then(function (item) {
        updateData(item);
      });
    } else {
      this.store.find(itemModelName).then(function (items) {
        items.forEach(function (item) {
          updateData(item);
        });
      });
    }

  },

  promptConfirmChanges: function () {
    if (this.get('removedControls.length') || this.get('changedNameControls.length') || this.get('changedRadioControls.length')) {
      Ember.Logger.log('Prompt for changed control or type id confirmation.');
      this.toggleProperty('confirmChangedControlsPrompt');
    } else {
      this.saveType();
    }
  },

  // we have updated associated items, we're go for type saving.
  saveType: function () {

    var formController = this;

    var wasNew = this.get('model.isNew');

    // update relationships
    // check if we changes relationship widget names
    var relationUpdates = this.updateRelations();

    // When all the relationships are updated, save this contentType.
    Ember.RSVP.Promise.all(relationUpdates).then(function () {

      Ember.Logger.info('Saving contentType `' + this.get('model.name') + '`');

      this.get('model').save().then(function (contentType) {

        // If the user changes the content type name, we must do the following
        // - move content type in firebase
        // - move data (items) in firebase
        // - update related items to point to new content type
        // - delete old search index
        // - add new search index
        if (formController.get('isNewTypeId')) {
          Ember.Logger.log('Creating new content type `%@` from `%@`.'.fmt(formController.get('newTypeId'), contentType.get('id')));

          var oldId = this.get('model.id');
          var newId = formController.get('newTypeId');

          var contentTypeRef = window.ENV.firebase.child('contentType');

          var contentTypePromise = new Ember.RSVP.Promise(function (resolve, reject) {
            contentTypeRef.child(oldId).once('value', function (snapshot) {
              contentTypeRef.child(newId).set(snapshot.val(), function () {
                Ember.Logger.log('Copied content type to `%@` from `%@`.'.fmt(newId, oldId));

                // delete old search index
                window.ENV.deleteTypeIndex(oldId);

                // kill old content type
                contentTypeRef.child(oldId).remove(function () {
                  Ember.Logger.log('Old content type `%@` destroyed.'.fmt(oldId));
                  Ember.run(null, resolve);
                });
              });
            });
          });

          var dataRef = window.ENV.firebase.child('data');

          var dataPromise = new Ember.RSVP.Promise(function (resolve, reject) {
            // copy data in firebase
            dataRef.child(oldId).once('value', function (snapshot) {
              dataRef.child(newId).set(snapshot.val(), function () {
                Ember.Logger.log('Copied data to `%@` from `%@`.'.fmt(newId, oldId));

                // update search index
                snapshot.forEach(function (childSnapshot) {
                  SearchIndex.indexItem(Ember.Object.create({
                    id: childSnapshot.name(),
                    data: childSnapshot.val()
                  }), Ember.Object.create({
                    oneOff: contentType.get('oneOff'),
                    id: newId
                  }));
                });

                // kill old data
                dataRef.child(oldId).remove(function () {
                  Ember.Logger.log('Old data for `%@` destroyed.'.fmt(oldId));
                  Ember.run(null, resolve);
                });
              });
            });
          });

          // Update relationships

          var relationControls = contentType.get('controls').filterBy('controlType.widget', 'relation');
          var relatedTypes = relationControls.getEach('meta.data.contentTypeId').uniq();

          relatedTypes.forEach(function (relatedTypeId) {

            var relationControlsForType = relationControls.filterBy('meta.data.contentTypeId', relatedTypeId);

            formController.store.find('content-type', relatedTypeId).then(function (relatedType) {

              relationControlsForType.forEach(function (control) {
                relatedType.get('controls').filterBy('name', control.get('meta.data.reverseName')).setEach('meta.data.contentTypeId', newId);
              });

              relatedType.save().then(function () {
                Ember.Logger.log('`%@` relation controls updated with new contentTypeId'.fmt(relatedTypeId));
              });

              var relatedItemModelName = getItemModelName(relatedType);
              formController.store.find(relatedItemModelName).then(function (items) {
                items.forEach(function (item) {

                  var changed = false;
                  var itemData = item.get('data');

                  relationControlsForType.forEach(function (control) {

                    Ember.Logger.log('Checking `%@` for `%@` data to update.'.fmt(item.get('data.name'), control.get('meta.data.reverseName')));

                    var targetData = itemData[control.get('meta.data.reverseName')];

                    if (!Ember.isEmpty(targetData)) {

                      Ember.Logger.log('Found data, updating.');

                      // relationships are saved as '{{contentTypeId}} {{itemId}}'
                      // match the {{contentTypeId}} + space and replace it with new

                      if (Ember.isArray(targetData)) {

                        targetData.forEach(function (value, index) {
                          targetData[index] = value.replace(oldId + ' ', newId + ' ');
                        });

                      } else {

                        targetData = targetData.replace(oldId + ' ', newId + ' ');

                      }

                      itemData[control.get('meta.data.reverseName')] = targetData;
                      changed = true;

                    } else {

                      Ember.Logger.log('No data found, skipping.');

                    }

                  });

                  if (changed) {
                    item.set('data', itemData);
                    item.save().then(function (savedItem) {
                      Ember.Logger.log('Data updates applied to `%@`'.fmt(item.get('data.name')));
                    });
                  } else {
                    Ember.Logger.log('No data changes for `%@`'.fmt(item.get('data.name')));
                  }
                });
              });

            });

          });

          Ember.RSVP.Promise.all([contentTypePromise, dataPromise]).then(function () {
            formController.transitionToRoute('wh.content.type.index', newId);
          });

          return;

        }

        if (contentType.get('oneOff')) {

          this.transitionToRoute('wh.content.type.index', contentType);
          this.send('notify', 'success', 'Form saved!');

        } else if (this.get('session.supportedMessages.scaffolding')) {

          if (wasNew) {

            this.scaffoldType();

            // Acknowledge scaffolding
            this.toggleProperty('initialScaffoldingPrompt');

          } else {

            if (this.get('session.supportedMessages.check_scaffolding') && contentType.get('individualMD5') && contentType.get('listMD5')) {

              window.ENV.sendGruntCommand('check_scaffolding:' + contentType.get('id'), function (data) {

                if (data && typeof data === 'object' && contentType.get('individualMD5') === data.individualMD5 && contentType.get('listMD5') === data.listMD5) {

                  formController.scaffoldType().then(function () {
                    formController.transitionToRoute('wh.content.type.index', contentType);
                  });

                } else {

                  formController.toggleProperty('scaffoldingPrompt');

                }

              });

            } else {

              // ask if they want to rebuild scaffolding
              this.toggleProperty('scaffoldingPrompt');

            }

          }

        } else {
          this.transitionToRoute('wh.content.type.index', contentType);
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

  scaffoldType: function () {

    var formController = this;
    var contentType = this.get('model');

    Ember.Logger.info('Building scaffolding for', contentType.get('id'));

    return new Ember.RSVP.Promise(function (resolve, reject) {

      window.ENV.sendGruntCommand('scaffolding_force:' + contentType.get('id'), function (data) {

        Ember.Logger.info('Scaffolding built for', contentType.get('id'));

        if (data && typeof data === 'object') {
          contentType.set('individualMD5', data.individualMD5);
          contentType.set('listMD5', data.listMD5);
          contentType.set('oneOffMD5', data.oneOffMD5);
          contentType.save();
        }
        formController.send('notify', 'success', 'Scaffolding for ' + contentType.get('name') + ' built.');
        Ember.run(null, resolve);
      });

    });
  },

  actions: {
    updateType: function () {

      Ember.Logger.info('Saving content type', this.get('model.id'));

      this.set('isEditing', false);

      this.validateControls();

      if (this.get('model.controls').isAny('widgetIsValid', false)) {
        Ember.Logger.warn('The following controls are invalid:', this.get('model.controls').filterBy('widgetIsValid', false).getEach('name'));
        return;
      }

      if (!this.get('isValidTypeId')) {
        Ember.Logger.warn('New type id would be invalid for the following reasons:', this.get('newTypeIdErrors').join(', '));
        return;
      }

      var formController = this;
      var contentType = this.get('model');

      // reset changedNameControls in case they backed out and decided to change the name back.
      formController.set('changedNameControls', Ember.A([]));

      // reset changedRadioControls in case they backed out and decided to change the values back
      formController.set('changedRadioControls', Ember.A([]));

      contentType.get('controls').forEach(function (control) {

        // See if we changed any control names
        if (control.get('originalName') && control.get('originalName') !== control.get('name')) {
          formController.get('changedNameControls').addObject(control);
        }

        // See if we changed any radio values
        if (control.get('controlType.widget') === 'radio') {
          var changedRadioControls = null;
          control.get('meta.data.options').getEach('value').forEach(function (value, index) {
            var originalValue = control.getWithDefault('originalOptions', Ember.A([])).objectAt(index);
            if (originalValue && originalValue !== value) {
              if (!changedRadioControls) {
                changedRadioControls = Ember.Object.create({
                  name: control.get('name'),
                  values: Ember.Object.create()
                });
              }
              changedRadioControls.get('values').set(originalValue, value);
            }
          });
          if (changedRadioControls) {
            formController.get('changedRadioControls').addObject(changedRadioControls);
          }
        }

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

      this.promptConfirmChanges();

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
        control.set('meta', this.store.createRecord('meta-data', { data: {} }));
      }

      this.set('editingControl', control);
      this.set('isEditing', true);
    },

    stopEditing: function () {
      this.set('isEditing', false);
    },

    startEditing: function () {
      this.send('editControl', this.get('editingControl') || this.get('model.controls.firstObject'));
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

      var formController = this;

      formController.scaffoldType().then(function () {
        formController.transitionToRoute('wh.content.type.index', formController.get('model'));
      });

    },

    abortScaffolding: function () {
      this.transitionToRoute('wh.content.type.index', this.get('model'));
    },

    confirmChangedControls: function () {
      this.toggleProperty('confirmChangedControlsPrompt');
      this.updateItems();
      this.saveType();
    },

    rejectChangedControls: function () {
      this.toggleProperty('confirmChangedControlsPrompt');
    },

    editTypeId: function () {
      this.toggleProperty('isEditingTypeId');
    }
  }
});
