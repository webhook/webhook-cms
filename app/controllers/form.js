/*globals ga*/
import getItemModelName from 'appkit/utils/model';
import SearchIndex from 'appkit/utils/search-index';
import downcode from 'appkit/utils/downcode';
import MetaWithOptions from 'appkit/utils/meta-options';

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

  validateControls: function () {

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
      control.set('widgetIsValid', false);
      control.get('widgetErrors').addObject('Duplicate name.');
    });

    this.get('controls').filterBy('controlType.widget', 'relation').forEach(function (control) {
      if (Ember.isNone(control.get('meta.contentTypeId'))) {
        control.set('widgetIsValid', false);
        control.get('widgetErrors').addObject('You must select a related content type.');
      }
    });

    // this.get('controls').filterBy('name', 'slug').forEach(function (control) {
    //   control.set('widgetIsValid', false);
    //   control.get('widgetErrors').addObject('Slug is a reserved name. Please choose another label.');
    // });

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

    var dupeNamesCount = controls.filterBy('label', controlType.get('name')).get('length');

    var label = controlType.get('name');

    if (dupeNamesCount) {
      label = label + ' ' + (dupeNamesCount + 1);
    }

    control = this.store.createRecord('control', {
      label      : label,
      controlType: controlType,
      showInCms  : (controls.filterBy('showInCms').get('length') < 3)
    });

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

    this.get('addedControls').addObject(control);

    if (controlType.get('id') === 'layout') {
      controlType.set('isHidden', true);
    }

  },

  removeRelations: function () {

    var controller = this;

    // Filter out relation controls that are related to their parent content type.
    var relationControls = this.get('removedControls').filterBy('controlType.widget', 'relation').filter(function (control) {
      return control.get('meta.contentTypeId') !== controller.get('model.id');
    });

    Ember.Logger.log('Removing %@ reverse relationships.'.fmt(relationControls.get('length')));

    var relationUpdates = relationControls.map(function (control) {

      Ember.Logger.log('- Removing `%@` from `%@`'.fmt(control.get('meta.reverseName'), control.get('meta.contentTypeId')));

      return controller.store.find('contentType', control.get('meta.contentTypeId')).then(function (contentType) {

        var controls = contentType.get('controls');
        var controlToRemove = controls.filterBy('name', control.get('meta.reverseName')).get('firstObject');
        controls.removeObject(controlToRemove);

        return contentType.save().then(function (contentType) {

          Ember.Logger.log('Removed `%@` from `%@`'.fmt(control.get('meta.reverseName'), control.get('meta.contentTypeId')));
          return Ember.RSVP.Promise.resolve(contentType);

        }).then(function (contentType) {

          // remove relation data from related content types
          var relatedContentTypeItemModelName = getItemModelName(contentType);

          var removeData = function (item) {

            var itemData = item.get('itemData');

            itemData[controlToRemove.get('name')] = null;

            item.set('itemData', itemData);

            return item.save().then(function (savedItem) {
              Ember.Logger.log('Relation data removed from `$@`'.fmt(savedItem.get('id')));
              SearchIndex.indexItem(savedItem, contentType);
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

      });

    });

    return Ember.RSVP.Promise.all(relationUpdates);

  },

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

  changeRelations: function () {

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

  updateForeignRelations: function () {
    return Ember.RSVP.Promise.all([
      this.removeRelations(),
      this.addRelations(),
      this.changeRelations()
    ]);
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

    Ember.Logger.log('Updating `%@` item data and search indices for %@ removed controls, %@ renamed controls, and %@ changed radio controls.'.fmt(itemModelName, removedControls.get('length'), changedNameControls.get('length'), changedRadioControls.get('length')));

    var updateData = function (item) {
      var itemData = item.get('itemData');

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

      item.set('itemData', itemData);

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

    Ember.Logger.info('Saving contentType `%@`'.fmt(this.get('model.name')));

    var formController = this;

    var wasNew = this.get('model.isNew');

    // When all the foreign relationships are updated, save this contentType.
    this.updateForeignRelations().then(function () {

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

              var relatedItemModelName = getItemModelName(relatedType);
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
            formController.transitionToRoute('wh.content.type.index', newId);
          });

          return;

        }

        if (wasNew) {

          this.scaffoldType();

          // Acknowledge scaffolding
          this.toggleProperty('initialScaffoldingPrompt');

        } else if (this.get('session.supportedMessages.scaffolding')) {

          this.isScaffoldingUnchanged().then(function () {
            formController.scaffoldType().then(function () {
              formController.transitionToRoute('wh.content.type.index', contentType);
            });
          }, function (error) {
            Ember.Logger.warn('Scaffolding changed', error);
            formController.toggleProperty('scaffoldingPrompt');
          });

        } else {

          this.transitionToRoute('wh.content.type.index', contentType);

        }

      }.bind(this), function (error) {

        Ember.Logger.error(error);

        if (window.trackJs) {
          window.trackJs.log("Attempted to save form.", formController.get('model'));
          window.trackJs.track(error);
        }

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

          window.ENV.sendGruntCommand('check_scaffolding:' + contentType.get('id'), function (data) {

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

        // we don't want to store checkbox values to the db when we save
        if (control.get('controlType.widget') === 'checkbox') {
          control.get('meta.options').setEach('value', null);
        }

        // force dirty state on all controls so they will save.
        // kind of a hack but meta data doesn't trigger dirty state.
        control.transitionTo('updated.uncommitted');
      });


      // Custom URLs
      if (Ember.isEmpty(contentType.get('customUrls.individualUrl'))) {
        contentType.set('customUrls.individualUrl', null);
      }
      if (Ember.isEmpty(contentType.get('customUrls.listUrl'))) {
        contentType.set('customUrls.listUrl', null);
      }

      this.promptConfirmChanges();

    },

    addControl: function (controlType, index) {
      this.addControl.apply(this, arguments);
    },

    deleteControl: function (control) {

      if (control.get('controlType.id') === 'layout') {
        this.store.getById('control-type', 'layout').set('isHidden', false);
      }

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
        control.set('meta', Ember.Object.create());
      }

      this.set('editingControl', control);
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
