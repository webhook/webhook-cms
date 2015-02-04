/*globals ga*/
import SearchIndex from 'appkit/utils/search-index';
import downcode from 'appkit/utils/downcode';
import MetaWithOptions from 'appkit/utils/meta-options';

export default Ember.ObjectController.extend(Ember.Evented, {
  controlTypeGroups: null,
  editingControl   : null,
  editingModel     : null,
  isEditing        : false,
  contentTypes     : null,
  relationTypes    : null,

  addedControls       : Ember.A([]),
  removedControls     : Ember.A([]),
  removedGridControls : Ember.A([]),
  changedNameControls : Ember.A([]),
  changedGridNameControls: Ember.A([]),
  changedRadioControls: Ember.A([]),
  changedRelationTypeControls: Ember.A([]),

  removedControlsApproved     : null,
  changedControlNamessApproved: null,

  isEditingTypeId: false,
  newTypeIdErrors: Ember.A([]),

  hasAddedControls: function () {
    return !!this.get('model.controls').rejectBy('hidden').rejectBy('name', 'name').get('length');
  }.property('model.controls.length'),

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

  correctSlug: function (slug) {
    if (Ember.isEmpty(slug)) {
      return null;
    }
    if (slug.charAt(0) === '/') {
      slug = slug.substr(1);
    }
    if (slug.substr(-1) === '/') {
      slug = slug.slice(0, -1);
    }
    slug = slug.replace(/\s+/g, '-');
    slug = downcode(slug);
    return slug;
  },

  invalidateControl: function (control, reason) {
    control.set('widgetIsValid', false);
    control.get('widgetErrors').addObject(reason);
  },

  validateControls: function () {

    var controller = this;

    this.get('controls').setEach('widgetIsValid', true);
    this.get('controls').forEach(function (control) {
      control.set('widgetErrors', Ember.A([]));
    });

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
    }).forEach(function (control) {
      controller.invalidateControl(control, 'Control name must be unique to form.');
    });

    this.get('controls').filter(function (control) {
      return /^[0-9]/.test(control.get('name'));
    }).forEach(function (control) {
      controller.invalidateControl(control, 'Control name cannot start with a number.');
    });

    this.get('controls').filterBy('controlType.widget', 'relation').forEach(function (control) {
      if (Ember.isNone(control.get('meta.contentTypeId'))) {
        controller.invalidateControl(control, 'You must select a related content type.');
      }
    });

    this.get('controls').filterBy('name', 'id').forEach(function (control) {
      controller.invalidateControl(control, '`id` is a reserved control name. Please choose another.');
    });

  },

  updateOrder: function (model, originalIndex, newIndex) {

    var controls = model.get('controls');
    var control = controls.objectAt(originalIndex);

    controls.removeAt(originalIndex);
    controls.insertAt(newIndex, control);

  },

  addControlAtIndex: function (model, controlTypeId, index) {
    this.store.find('control-type', controlTypeId).then(function (controlType) {
      this.addControl(model, controlType, index);
    }.bind(this));
  },

  addControl: function (model, controlType, index) {

    var controls = model.get('controls');

    var label = controlType.get('name');

    var control = this.store.createRecord('control', {
      label      : label,
      controlType: controlType,
      showInCms  : (controls.filterBy('showInCms').get('length') < 3)
    });

    var dupeCount = 0;

    while (controls.isAny('name', control.get('name'))) {
      dupeCount++;
      control.set('label', label + ' ' + dupeCount);
    }

    control.set('widgetIsValid', true);

    var meta;

    switch (controlType.get('widget')) {
      case 'instruction':
        control.set('showInCms', false);
        break;
      case 'radio':
        meta = MetaWithOptions.create({
          options: [
            { value: 'Option 1' },
            { value: 'Option 2' }
          ]
        });
        break;
      case 'layout':
        meta = MetaWithOptions.create({
          defaultValue: '',
          options: [
            { label: 'None', value: '' },
            { label: 'Layout', value: 'layout.html' }
          ]
        });
        break;
      case 'select':
        meta = MetaWithOptions.create({
          defaultValue: '',
          options: [
            { value: '' },
            { value: 'Option 1' }
          ]
        });
        break;
      case 'checkbox':
        meta = MetaWithOptions.create({
          options: [
            { label: 'Option 1' },
            { label: 'Option 2' }
          ]
        });
        break;
      case 'boolean':
        meta = Ember.Object.create({
          defaultValue: false
        });
        break;
      case 'wysiwyg':
        meta = Ember.Object.create({
          image: true,
          link : true,
          quote: true,
          table: true,
          video: true
        });
        break;
      case 'rating':
        meta = Ember.Object.create({
          min: 0,
          max: 5,
          step: 0.5
        });
        break;
      case 'tabular':
        meta = MetaWithOptions.create({
          options: [
            { value: 'Column 1' },
            { value: 'Column 2' }
          ]
        });
        var value = Ember.A([]);
        var emptyRow = Ember.A([]);
        meta.get('options').forEach(function () {
          emptyRow.pushObject("");
        });
        value.pushObject(emptyRow);
        control.set('value', value);
        break;

      case 'relation':
        meta = Ember.Object.create({ contentTypeId: null });
        break;
    }

    control.set('meta', meta);

    if (index) {
      controls.insertAt(index, control);
    } else {
      controls.pushObject(control);
    }

    if (controlType.get('id') === 'layout') {
      controlType.set('isHidden', true);
    }

    if (model.get('constructor.typeKey') === 'contentType') {
      this.get('addedControls').addObject(control);
    }

  },

  // If a relation widget is removed, the reverse widget and data must be removed from the related content type
  removeRelations: function () {

    var controller = this;

    // Filter out relation controls that are related to their parent content type.
    var relationControls = this.get('removedControls').filterBy('controlType.widget', 'relation').filter(function (control) {
      return control.get('originalRelatedContentTypeId') !== controller.get('model.id');
    });

    Ember.Logger.log('Removing %@ reverse relationships.'.fmt(relationControls.get('length')));

    var relationUpdates = relationControls.map(function (control) {

      Ember.Logger.log('- Removing `%@` from `%@`'.fmt(control.get('meta.reverseName'), control.get('originalRelatedContentTypeId')));

      return controller.store.find('contentType', control.get('originalRelatedContentTypeId')).then(function (contentType) {

        var controls = contentType.get('controls');
        var controlToRemove = controls.findBy('name', control.get('meta.reverseName'));
        controls.removeObject(controlToRemove);

        return contentType.save().then(function (contentType) {

          Ember.Logger.log('- Removed `%@` from `%@`'.fmt(control.get('meta.reverseName'), control.get('originalRelatedContentTypeId')));
          return Ember.RSVP.Promise.resolve(contentType);

        }).then(function (contentType) {

          // remove relation data from related content types
          var relatedContentTypeItemModelName = contentType.get('itemModelName');

          var removeData = function (item) {

            var itemData = item.get('itemData');

            itemData[controlToRemove.get('name')] = null;

            item.set('itemData', itemData);

            return item.save().then(function (savedItem) {
              Ember.Logger.log('- Relation data removed from `%@`'.fmt(savedItem.get('id')));
            });

          };

          if (contentType.get('oneOff')) {
            return controller.store.find(relatedContentTypeItemModelName, contentType.get('id')).then(removeData);
          } else {
            return controller.store.find(relatedContentTypeItemModelName).then(function (items) {
              return Ember.RSVP.Promise.all(items.map(removeData));
            });
          }

        });

      }, function (error) {
        if (error.message && error.message.indexOf('no record was found') === 0) {
          Ember.Logger.warn('- `%@` contentType does not exist.'.fmt(error.recordId));
        } else {
          Ember.RSVP.Promise.reject(error);
        }
      });

    });

    return Ember.RSVP.Promise.all(relationUpdates);

  },

  // If you add a relation control, the reverse control must be added on the related content type
  addRelations: function () {

    var controller = this;

    // Filter out relation controls that are related to their parent content type.
    var relationControls = this.get('addedControls').filterBy('controlType.widget', 'relation').filter(function (control) {

      var isSelfRelated = control.get('meta.contentTypeId') === controller.get('model.id');

      if (isSelfRelated) {
        control.set('meta.reverseName', control.get('name'));
      }

      return !isSelfRelated;
    });

    Ember.Logger.log('Adding %@ reverse relationships.'.fmt(relationControls.get('length')));

    var relationUpdates = relationControls.map(function (localControl) {

      Ember.Logger.log('- Adding `%@` to `%@`'.fmt(localControl.get('name'), localControl.get('meta.contentTypeId')));

      return controller.store.find('contentType', localControl.get('meta.contentTypeId')).then(function (contentType) {

        var foreignControls = contentType.get('controls');
        var foreignRelations = foreignControls.filterBy('controlType.widget', 'relation');

        return controller.store.find('control-type', 'relation').then(function (controlType) {

          var capitalizedModelName = controller.get('model.name').charAt(0).toUpperCase() + controller.get('model.name').slice(1);
          var controlLabel = '%@ (%@)'.fmt(capitalizedModelName, localControl.get('label'));

          var control = controller.store.createRecord('control', {
            label: controlLabel,
            controlType: controlType,
            meta: Ember.Object.create({
              contentTypeId: controller.get('model.id'),
              reverseName: localControl.get('name')
            })
          });

          // The new reverse relation control must have a unique name
          var counter = 1;
          while (foreignControls.getEach('name').indexOf(control.get('name')) >= 0) {
            counter = counter + 1;
            control.set('label', controlLabel + ' ' + counter);
          }

          Ember.Logger.log('Setting unique name for reverse relationship: `%@` on `%@`'.fmt(control.get('name'), contentType.get('id')));

          // Remember reverse relation name in meta data
          localControl.set('meta.reverseName', control.get('name'));

          // Add new relation control to the stack
          contentType.get('controls').pushObject(control);

          return contentType.save().then(function (contentType) {
            Ember.Logger.log('Reverse relationship of `%@` to `%@` added.'.fmt(localControl.get('name'), localControl.get('meta.contentTypeId')));
            return Ember.RSVP.Promise.resolve(contentType);
          });

        });

      });

    });

    return Ember.RSVP.Promise.all(relationUpdates);
  },

  // If the name of the relation widget is changed, reverse relations must be updated to point back to new name
  changeRelationNames: function () {

    var controller = this;

    // Filter out relation controls that are related to their parent content type.
    var relationControls = this.get('changedNameControls').filterBy('controlType.widget', 'relation').filter(function (control) {
      return control.get('meta.contentTypeId') !== controller.get('model.id');
    });

    Ember.Logger.log('Updating %@ reverse relationships.'.fmt(relationControls.get('length')));

    var relationUpdates = relationControls.map(function (localControl) {

      Ember.Logger.log('- Updating `%@` to `%@`'.fmt(localControl.get('name'), localControl.get('meta.contentTypeId')));

      return controller.store.find('contentType', localControl.get('meta.contentTypeId')).then(function (contentType) {

        var foreignControls = contentType.get('controls');
        var foreignRelations = foreignControls.filterBy('controlType.widget', 'relation');

        foreignControls.filterBy('name', localControl.get('meta.reverseName')).setEach('meta.reverseName', localControl.get('name'));

        contentType.save().then(function (contentType) {
          Ember.Logger.log('`%@` updated.'.fmt(contentType.get('name')));
        });

      });

    });

    return Ember.RSVP.Promise.all(relationUpdates);
  },

  // If the relation type is changed from multi to single or single to multi, update data to reflect change
  changeRelationTypes: function () {

    var controller = this;

    // Filter out relation controls that are related to their parent content type.
    var relationControls = this.get('changedRelationTypeControls');

    Ember.Logger.log('Updating data for %@ changed relationship types.'.fmt(relationControls.get('length')));

    if (Ember.isEmpty(relationControls)) {
      return Ember.RSVP.Promise.resolve();
    }

    // Change data in every item for this content type
    return controller.store.find(controller.get('model.itemModelName')).then(function (items) {

      var itemUpdates = items.map(function (item) {

        var itemData = item.get('itemData');

        relationControls.forEach(function (control) {

          var controlValue = itemData[control.get('name')];
          var updatedValue = null;

          if (!Ember.isEmpty(controlValue)) {

            if (control.get('meta.isSingle')) {

              // changing to single relation type, use the first value
              updatedValue = Ember.isArray(controlValue) ? controlValue.shift() : controlValue;

              // remove reverse relationship of any remaining values
              if (Ember.isArray(controlValue)) {
                controlValue.forEach(function (relationKey) {
                  controller.store.find('content-type', relationKey.split(' ')[0]).then(function (contentType) {
                    controller.store.find(contentType.get('itemModelName'), relationKey.split(' ')[1]).then(function (reverseItem) {
                      var reverseItemData = reverseItem.get('itemData');
                      var reverseItemControlData = reverseItemData[control.get('meta.reverseName')];
                      var updatedReverseItemControlData = null;

                      if (Ember.isArray(reverseItemControlData)) {
                        var nearKey = controller.get('model.id') + ' ' + item.get('id');
                        updatedReverseItemControlData = Ember.A(reverseItemControlData).removeObject(nearKey);
                      }

                      reverseItemData[control.get('meta.reverseName')] = updatedReverseItemControlData;

                      reverseItem.set('itemData', reverseItemData).save();
                    });
                  });
                });
              }

            } else {
              updatedValue = Ember.isArray(controlValue) ? controlValue : [controlValue];
            }

          }

          itemData[control.get('name')] = updatedValue;
        });

        return item.set('itemData', itemData).save();

      });

      return Ember.RSVP.Promise.all(itemUpdates);

    });
  },

  updateForeignRelations: function () {
    return this.removeRelations()
      .then(this.addRelations.bind(this))
      .then(this.changeRelationNames.bind(this))
      .then(this.changeRelationTypes.bind(this));
  },

  updateItems: function () {

    // if the content type is new, we do not need to do anything
    if (this.get('model.isNew')) {
      return;
    }

    var changedNameControls = this.get('changedNameControls');
    var changedGridNameControls = this.get('changedGridNameControls');
    var removedControls = this.get('removedControls');
    var removedGridControls = this.get('removedGridControls');
    var changedRadioControls = this.get('changedRadioControls');
    var contentType = this.get('model');

    // if we didn't remove controls or change control names we do not need to update anything
    if (!removedControls.get('length') && !removedGridControls.get('length') && !changedNameControls.get('length') && !changedGridNameControls.get('length') && !changedRadioControls.get('length')) {
      Ember.Logger.info('Item updates not needed');
      return;
    }

    var itemModelName = contentType.get('itemModelName');

    Ember.Logger.log('Updating `%@` item data and search indices for %@ removed controls, %@ renamed controls, and %@ changed radio controls.'.fmt(itemModelName, removedControls.get('length'), changedNameControls.get('length'), changedRadioControls.get('length')));

    var updateData = function (item) {
      var itemData = item.get('itemData');

      changedNameControls.forEach(function (control) {
        itemData[control.get('name')] = itemData[control.get('originalName')] === undefined ? null : itemData[control.get('originalName')];
        itemData[control.get('originalName')] = null;
      });

      changedGridNameControls.forEach(function (controlPair) {
        if (Ember.isArray(itemData[controlPair.get('gridControl.name')])) {
          itemData[controlPair.get('gridControl.name')].forEach(function (gridItem) {
            gridItem[controlPair.get('control.name')] = gridItem[controlPair.get('control.originalName')] === undefined ? null : gridItem[controlPair.get('control.originalName')];
            gridItem[controlPair.get('control.originalName')] = null;
          });
        }
      });

      removedControls.forEach(function (control) {
        itemData[control.get('originalName')] = null;
      });

      removedGridControls.forEach(function (controlPair) {
        if (Ember.isArray(itemData[controlPair.get('gridControl.name')])) {
          itemData[controlPair.get('gridControl.name')].forEach(function (gridItem) {
            gridItem[controlPair.get('control.name')] = null;
          });
        }
      });

      changedRadioControls.forEach(function (control) {
        if (itemData[control.get('name')]) {
          itemData[control.get('name')] = control.get('values').get(itemData[control.get('name')]) ? control.get('values').get(itemData[control.get('name')]) : itemData[control.get('name')];
        }
      });

      item.set('itemData', itemData);

      item.save().then(function (savedItem) {
        Ember.Logger.info('Data updates applied to', savedItem.get('id'));
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
    if (this.get('removedControls.length') ||
        this.get('removedGridControls.length') ||
        this.get('changedNameControls.length') ||
        this.get('changedGridNameControls.length') ||
        this.get('changedRadioControls.length') ||
        this.get('changedRelationTypeControls.length')) {
      this.toggleProperty('confirmChangedControlsPrompt');
    } else {
      this.saveType();
    }
  },

  // we have updated associated items, we're go for type saving.
  saveType: function () {

    var formController = this;

    var wasNew = this.get('model.isNew');

    // When all the foreign relationships are updated, save this contentType.
    this.updateForeignRelations().then(function () {

      Ember.Logger.log('Saving contentType `%@`'.fmt(formController.get('model.name')));

      formController.get('model').save().then(function (contentType) {

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
                SearchIndex.deleteType(oldId);

                // kill old content type
                contentTypeRef.child(oldId).remove(function () {
                  Ember.Logger.log('Old content type `%@` destroyed.'.fmt(oldId));
                  contentType.unloadRecord();
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

                // kill old data
                dataRef.child(oldId).remove(function () {
                  Ember.Logger.log('Old data for `%@` destroyed.'.fmt(oldId));
                  Ember.run(null, resolve);
                });
              });
            });
          });


          // Update foreign relationships with changed control name

          var relationControls = contentType.get('controls').filterBy('controlType.widget', 'relation');
          var relatedTypes = relationControls.getEach('meta.contentTypeId').uniq();

          relatedTypes.forEach(function (relatedTypeId) {

            var relationControlsForType = relationControls.filterBy('meta.contentTypeId', relatedTypeId);

            formController.store.find('content-type', relatedTypeId).then(function (relatedType) {

              relationControlsForType.forEach(function (control) {
                relatedType.get('controls').filterBy('name', control.get('meta.reverseName')).setEach('meta.contentTypeId', newId);
              });

              relatedType.save().then(function () {
                Ember.Logger.log('`%@` relation controls updated with new contentTypeId'.fmt(relatedTypeId));
              });

              var relatedItemModelName = relatedType.get('itemModelName');
              formController.store.find(relatedItemModelName).then(function (items) {
                items.forEach(function (item) {

                  var changed = false;
                  var itemData = item.get('itemData');

                  relationControlsForType.forEach(function (control) {

                    Ember.Logger.log('Checking `%@` for `%@` data to update.'.fmt(item.get('data.name'), control.get('meta.reverseName')));

                    var targetData = itemData[control.get('meta.reverseName')];

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

                      itemData[control.get('meta.reverseName')] = targetData;
                      changed = true;

                    } else {

                      Ember.Logger.log('No data found, skipping.');

                    }

                  });

                  if (changed) {
                    item.set('itemData', itemData);
                    item.save().then(function (savedItem) {
                      Ember.Logger.log('Data updates applied to `%@`'.fmt(item.get('itemData.name')));
                    });
                  } else {
                    Ember.Logger.log('No data changes for `%@`'.fmt(item.get('itemData.name')));
                  }
                });
              });

            });

          });

          Ember.RSVP.Promise.all([contentTypePromise, dataPromise]).then(function () {
            formController.store.find('content-type', newId).then(function (contentType) {
              SearchIndex.indexType(contentType);
              formController.transitionToRoute('wh.content.type.index', contentType);
            });
          });

          return;

        }

        if (wasNew) {

          this.scaffoldType();

          // Acknowledge scaffolding
          this.toggleProperty('initialScaffoldingPrompt');

        } else if (this.get('session.supportedMessages.scaffolding')) {

          // If scaffolding is unchanged, rebuild scaffolding, otherwise move on.
          this.isScaffoldingUnchanged().then(this.scaffoldType.bind(this), function (error) {
            Ember.Logger.log('Skipping scaffolding: %@'.fmt(error));
            formController.transitionToRoute('wh.content.type.index', contentType);
          }).then(function () {
            formController.transitionToRoute('wh.content.type.index', contentType);
          });

        } else {

          this.transitionToRoute('wh.content.type.index', contentType);

        }

      }.bind(this), function (error) {

        Ember.Logger.error(error);

        formController.send('notify', 'danger', 'There was an error while saving.');

      });

    }.bind(this));

  },

  isScaffoldingUnchanged: function () {

    var controller = this;
    var contentType = this.get('model');

    var isMD5Equal = function (contentType, data) {

      if (data && typeof data === 'object') {

        if (contentType.get('oneOff')) {

          if (contentType.get('oneOffMD5') !== data.oneOffMD5) {
            return false;
          }

          return true;

        } else {

          if (contentType.get('individualMD5') !== data.individualMD5) {
            return false;
          }

          if (contentType.get('listMD5') !== data.listMD5) {
            return false;
          }

          return true;

        }

      }

      return false;

    };

    var hasMD5 = function (contentType) {

      if (contentType.get('oneOff')) {
        if (Ember.isNone(contentType.get('oneOffMD5'))) {
          return false;
        } else {
          return true;
        }
      }

      if (Ember.isNone(contentType.get('individualMD5'))) {
        return false;
      }

      if (Ember.isNone(contentType.get('listMD5'))) {
        return false;
      }

      return true;

    };

    return new Ember.RSVP.Promise(function (resolve, reject) {

      if (controller.get('session.supportedMessages.check_scaffolding')) {
        if (hasMD5(contentType)) {

          Ember.Logger.log('Checking scaffolding MD5s.');

          controller.send('gruntCommand', 'check_scaffolding:' + contentType.get('id'), function (data) {

            if (isMD5Equal(contentType, data)) {
              resolve();
            } else {
              reject('MD5 does not match');
            }

          });

        } else {
          reject('missing scaffolding MD5');
        }
      } else {
        reject('check_scaffolding not supported');
      }

    });

  },

  scaffoldType: function () {

    var formController = this;
    var contentType = this.get('model');

    Ember.Logger.info('Building scaffolding for', contentType.get('id'));

    return new Ember.RSVP.Promise(function (resolve, reject) {

      formController.send('gruntCommand', 'scaffolding_force:' + contentType.get('id'), function (data) {

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

      ga('send', 'event', 'contentType', 'save');

      this.set('isEditing', false);

      this.validateControls();

      if (this.get('model.controls').isAny('widgetIsValid', false)) {
        Ember.Logger.warn('The following controls are invalid: %@.'.fmt(this.get('model.controls').filterBy('widgetIsValid', false).getEach('name').join(', ')));
        return;
      }

      if (!this.get('isValidTypeId')) {
        Ember.Logger.warn('New type id would be invalid for the following reasons: %@.'.fmt(this.get('newTypeIdErrors').join(', ')));
        return;
      }

      var formController = this;
      var contentType = this.get('model');

      // reset changedNameControls in case they backed out and decided to change the name back.
      formController.get('changedNameControls').clear();
      formController.get('changedGridNameControls').clear();

      // reset changedRadioControls in case they backed out and decided to change the values back
      formController.get('changedRadioControls').clear();

      // reset changedRelationTypeControls in case they backed out and decided to change the values back
      formController.get('changedRelationTypeControls').clear();

      contentType.get('controls').forEach(function (control) {

        // See if we changed any control names
        if (control.get('originalName') && control.get('originalName') !== control.get('name')) {
          formController.get('changedNameControls').addObject(control);
        }

        // See if we changed any grid sub control names
        if (control.get('controlType.widget') === 'grid') {
          control.get('controls').forEach(function (subControl) {
            if (subControl.get('originalName') && subControl.get('originalName') !== subControl.get('name')) {
              formController.get('changedGridNameControls').addObject(Ember.Object.create({
                gridControl: control,
                control: subControl
              }));
            }
          });
        }

        // See if we changed any radio values
        if (control.get('controlType.widget') === 'radio') {
          var changedRadioControls = null;
          control.get('meta.options').getEach('value').forEach(function (value, index) {
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

        if (control.get('controlType.widget') === 'relation' && !contentType.get('isNew')) {

          // See if related content type changed on relation widgets
          // Behavior is to act as if old relation widget was removed and new one was added
          if (!Ember.isEmpty(control.get('originalRelatedContentTypeId')) && control.get('originalRelatedContentTypeId') !== control.get('meta.contentTypeId')) {
            formController.get('removedControls').addObject(control);
            formController.get('addedControls').addObject(control);
          }

          // See if relation widget changed from single to multi or visa vera
          if (control.get('originalRelatedIsSingle') !== control.get('meta.isSingle')) {
            formController.get('changedRelationTypeControls').addObject(control);
          }

        }

        // we don't want to store checkbox values to the db when we save
        if (control.get('controlType.widget') === 'checkbox') {
          control.get('meta.options').setEach('value', null);
          control.get('meta.options').forEach(function (option) {
            if (Ember.isEmpty(option.defaultValue)) {
              option.defaultValue = false;
            }
          });
        }

        // force dirty state on all controls so they will save.
        // kind of a hack but meta data doesn't trigger dirty state.
        control.transitionTo('updated.uncommitted');
      });

      // Custom URLs
      if (typeof contentType.get('customUrls') === 'object') {
        if (Ember.isEmpty(contentType.get('customUrls.individualUrl'))) {
          contentType.set('customUrls.individualUrl', null);
        }
        if (Ember.isEmpty(contentType.get('customUrls.listUrl'))) {
          contentType.set('customUrls.listUrl', null);
        }
      }

      this.promptConfirmChanges();

    },

    addControl: function (controlType, index) {
      this.addControl(this.get('model'), controlType, index);
    },

    deleteControl: function (control, model) {

      var controls = model.get('controls');

      if (control.get('controlType.id') === 'layout') {
        this.store.getById('control-type', 'layout').set('isHidden', false);
      }

      if (model.get('constructor.typeKey') === 'contentType') {
        if (this.get('addedControls').indexOf(control) >= 0) {
          this.get('addedControls').removeObject(control);
        } else {
          this.get('removedControls').addObject(control);
        }
      } else if (model.get('constructor.typeKey') === 'control') {
        this.get('removedGridControls').addObject(Ember.Object.create({
          gridControl: model,
          control: control
        }));
      }

      control.set('justDeleted', true);

      Ember.run.later(this, function () {
        controls.removeObject(control);
      }, 500);

      this.set('editingControl', null);
      this.set('editingModel', null);
      this.send('stopEditing');

    },

    editControl: function (control, model) {

      if (!control.get('meta')) {
        control.set('meta', Ember.Object.create());
      }

      this.set('editingControl', control);
      this.set('editingModel', model);
      this.set('isEditing', true);
      this.set('isEditingTypeId', false);
    },

    stopEditing: function () {
      this.set('isEditing', false);
      this.set('isEditingTypeId', false);
    },

    startEditing: function () {
      this.send('editControl', this.get('editingControl') || this.get('model.controls.firstObject'));
    },

    addOption: function (array, index) {
      if (array.get('length') > index + 1) {
        array.insertAt(index + 1, {});
      } else {
        array.pushObject({});
      }
      var control = this.get('editingControl');
      if (control.get('controlType.widget') === 'tabular') {
        control.get('value').forEach(function (row) {
          row.pushObject("");
        });
      }
    },

    removeOption: function (array, index) {
      var control = this.get('editingControl');
      if (control.get('controlType.widget') === 'tabular') {
        control.get('value').forEach(function (row) {
          row.removeAt(index);
        });
      }
      array.removeAt(index);
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

    confirmChangedControls: function () {
      this.toggleProperty('confirmChangedControlsPrompt');
      this.updateItems();
      this.saveType();
    },

    rejectChangedControls: function () {
      this.toggleProperty('confirmChangedControlsPrompt');
    },

    editTypeId: function () {
      this.set('isEditing', false);
      this.set('isEditingTypeId', true);
    },

    correctIndividualUrl: function () {
      this.set('customUrls.individualUrl', this.correctSlug(this.get('customUrls.individualUrl')));
    },

    correctListUrl: function () {
      this.set('customUrls.listUrl', this.correctSlug(this.get('customUrls.listUrl')));
    }
  }
});
