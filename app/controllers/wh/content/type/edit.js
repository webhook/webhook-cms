/*globals ga*/
import validateControls from 'appkit/utils/validators';
import dataFromControls from 'appkit/utils/controls';
import uuid from 'appkit/utils/uuid';
import SearchIndex from 'appkit/utils/search-index';
import slugger from 'appkit/utils/slugger';

export default Ember.ObjectController.extend({
  type        : null,

  lastUpdated: function () {
    return this.get('type.controls').findBy('name', 'last_updated').get('value');
  }.property(),

  createDate: function () {
    return this.get('type.controls').findBy('name', 'create_date').get('value');
  }.property(),

  isDraft     : null,
  publishDate : null,
  showSchedule: false,
  itemModel   : null,
  previewUrl  : null,
  initialRelations: Ember.Object.create(),
  initialValues: Ember.A([]),

  // if this is a new item, we want to redirect after save
  isNew: true,

  nameControl: null,
  slugControl: null,

  isEditingSlug: false,

  fullPreviewUrl: function () {

    if(this.get('previewUrl') === null) {
      this.set('previewUrl', this.get('type.controls').findBy('name', 'preview_url').get('value'));
    }

    if(!this.get('previewUrl')) {
      return null;
    }

    var customListUrl = this.get('type.customUrls.listUrl');
    var id = this.get('type.id');
    var urlPrefix = '/_wh_previews/';

    // If no custom url, use the type id
    if(!customListUrl) {
      urlPrefix += id + '/';
    } else if (customListUrl !== '#') { // If the custom url is # we dont have anything, else use it
      urlPrefix += customListUrl + '/';
    }

    return urlPrefix + this.get('previewUrl') + '/';

  }.property('previewUrl'),

  isNameAndSlugValid: function () {
    return this.get('nameControl.widgetIsValid') && this.get('slugControl.widgetIsValid');
  }.property('nameControl.widgetIsValid', 'slugControl.widgetIsValid'),

  showSlug: function () {
    return !Ember.isEmpty(this.get('nameControl.value')) && !this.get('type.oneOff');
  }.property('nameControl.value', 'type.oneOff'),

  defaultSlug: function () {

    var sluggedDate = (Ember.isEmpty(this.get('publishDate')) ? moment() : moment(this.get('publishDate'))).format();

    return slugger({
      name: this.get('nameControl.value'),
      publish_date: sluggedDate
    }, this.get('type.id'), this.get('type.customUrls'));

  }.property('nameControl.value', 'type.id', 'slugControl.value', 'publishDate'),

  // Remove old slug, add new slug
  updateSlug: function () {
    var slugControl = this.get('controls').findBy('name', 'slug');

    window.ENV.firebase.child('slugs').child(slugControl.get('initialValue')).remove();

    var slug = slugControl.get('value') || this.get('defaultSlug');

    window.ENV.firebase.child('slugs').child(slug).set(true);

    slugControl.set('initialValue', slug);
  },

  isLive: function () {
    if (this.get('showSchedule')) {
      return false;
    }
    if (!this.get('publishDate') || this.get('isDraft')) {
      return false;
    }
    return moment(this.get('publishDate')).isBefore();
  }.property('publishDate', 'isDraft', 'showSchedule'),

  isScheduled: function () {
    if (this.get('showSchedule')) {
      return true;
    }
    if (!this.get('publishDate') || this.get('isDraft')) {
      return false;
    }
    return moment(this.get('publishDate')).isAfter();
  }.property('publishDate', 'isDraft', 'showSchedule'),

  isDirty: function () {

    var isDirty = false;

    this.get('controls').getEach('value').forEach(function (value, index) {
      if (!isDirty) {
        var initialValue = this.get('initialValues').objectAt(index);
        if ((value !== "" || initialValue !== undefined) && (value !== initialValue)) {
          isDirty = true;
        }
      }
    }.bind(this));

    return isDirty;

  }.property('controls.@each.value'),

  handleBeforeUnload: function () {
    return 'It looks like you have been editing something -- if you leave before submitting your changes will be lost.';
  },

  watchForUnload: function () {
    if (this.get('isDirty')) {
      Ember.Logger.info('Item is dirty, prevent navigation.');
      Ember.$(window).one('beforeunload', this.handleBeforeUnload);
    } else {
      Ember.Logger.info('Item is clean.');
      Ember.$(window).off('beforeunload', this.handleBeforeUnload);
    }
  }.observes('isDirty'),

  updateReverseRelationships: function () {

    var controller = this;
    var itemModel = this.get('itemModel');

    // Filter out relation controls that are related to their parent content type.
    var relationControls = controller.get('controls').filterBy('controlType.widget', 'relation');

    Ember.Logger.log('Updating %@ reverse relationships.'.fmt(relationControls.get('length')));

    var relationPromises = Ember.A([]);

    relationControls.rejectBy('disabled', true).forEach(function (control) {

      var currentRelations = control.get('value') || Ember.A([]);
      var initialRelations = controller.get('initialRelations').get(control.get('name')) || Ember.A([]);

      // added relations is temporarily all values so that
      // var addedRelations = Ember.$(currentRelations).not(initialRelations).get();
      var addedRelations = currentRelations;
      var removedRelations = Ember.$(initialRelations).not(currentRelations).get();

      Ember.Logger.log('`%@` added %@ and removed %@ relationships'.fmt(control.get('name'), addedRelations.get('length'), removedRelations.get('length')));

      var updateRelation = function (relatedItem, updateType) {

        var contentTypeId = relatedItem.split(' ')[0];
        var itemId = relatedItem.split(' ')[1];
        var relatedValue = controller.get('type.id') + ' ' + itemModel.get('id');

        Ember.Logger.log('`%@` wants to %@ "%@" %@ `%@:%@`'.fmt(control.get('name'), updateType, relatedValue, updateType === 'add' ? 'to' : 'from', relatedItem, control.get('meta.reverseName')));

        return controller.store.find('contentType', contentTypeId).then(function (contentType) {
          var modelName = contentType.get('itemModelName');
          var foreignControls = contentType.get('controls');
          var reverseControl = control.get('meta.reverseName') && foreignControls.findBy('name', control.get('meta.reverseName'));

          // Legacy support
          // If we don't have a reverse relationship, add it.
          if (reverseControl) {

            return Ember.RSVP.Promise.resolve(contentType);

          } else {

            Ember.Logger.warn('Reverse control NOT found for `%@` on `%@`, creating it.'.fmt(control.get('name'), contentType.get('name')));

            return controller.store.find('control-type', 'relation').then(function (controlType) {

              var reverseControl = controller.store.createRecord('control', {
                label: controller.get('type.name'),
                controlType: controlType,
                meta: Ember.Object.create({
                  contentTypeId: controller.get('type.id'),
                  reverseName: control.get('name')
                })
              });

              Ember.Logger.log('Setting new reverse control label to `%@`'.fmt(reverseControl.get('label')));

              // The new reverse relation control must have a unique name
              var counter = 1, counterName;
              while (foreignControls.getEach('name').indexOf(reverseControl.get('name')) >= 0) {
                counter = counter + 1;
                counterName = controller.get('type.name') + ' ' + counter;
                Ember.Logger.log('Duplicate control name detected, setting to `%@`'.fmt(counterName));
                reverseControl.set('label', counterName);
              }

              foreignControls.addObject(reverseControl);

              // update near side contentType relation control with reverse name.
              control.set('meta.reverseName', reverseControl.get('name'));
              return controller.get('type').save().then(function () {

                // update far side contentType relation control
                return contentType.save().then(function () {
                  Ember.Logger.log('Reverse relationship of `%@` to `%@` successfully added.'.fmt(control.get('name'), reverseControl.get('name')));
                  return Ember.RSVP.Promise.resolve(contentType);
                });

              });

            });

          }

        }).then(function (contentType) {

          // Find and update reverse item.
          return controller.store.find(contentType.get('itemModelName'), itemId).then(function (reverseItem) {

            var reverseName = control.get('meta.reverseName');
            var reverseControl = contentType.get('controls').findBy('name', reverseName);
            var reverseValue = reverseItem.get('itemData')[reverseName];

            if (reverseControl.get('meta.isSingle')) {

              if (updateType === 'remove') {
                reverseItem.get('itemData')[reverseName] = null;
              } else {

                // if reverse control is single and already has a value, make sure it is removed from its previously related item
                // example:
                // - Articles can only have one Author.
                // - In Author form add Article that already has an Author.
                // - Must replace previous Author on Article.
                // - Must remove Article from previous Author.
                if (!Ember.isEmpty(reverseValue) && reverseValue !== controller.get('type.id') + ' ' + itemModel.get('id')) {
                  Ember.Logger.log('Removing previous single relationship');
                  controller.store.find(reverseValue.split(' ')[0], reverseValue.split(' ')[1]).then(function (previouslyRelatedItem) {
                    var reverseControlName = reverseControl.get('meta.reverseName');
                    var itemData = previouslyRelatedItem.get('itemData');

                    if (typeof itemData[reverseControlName] === 'string') {
                      itemData[reverseControlName] = null;
                    } else {
                      itemData[reverseControlName] = Ember.A(itemData[reverseControlName]).removeObject(contentType.get('id') + ' ' + reverseItem.get('id'));
                    }

                    previouslyRelatedItem.set('itemData', itemData).save();
                  });
                }

                reverseItem.get('itemData')[reverseName] = relatedValue;
              }

            } else {

              var currentItems = reverseItem.get('itemData')[reverseName];

              if (Ember.isEmpty(currentItems)) {
                currentItems = Ember.A([]);
              }

              if (typeof currentItems === 'string') {
                currentItems = Ember.A([currentItems]);
              }

              if (updateType === 'remove') {
                currentItems.removeObject(relatedValue);
              }

              if (updateType === 'add') {
                currentItems.addObject(relatedValue);
              }

              reverseItem.get('itemData')[reverseName] = currentItems;

            }

            return reverseItem.save().then(function (item) {
              Ember.Logger.log('`%@` updated `%@:%@` to `%@`.'.fmt(control.get('name'), reverseItem.get('itemData.name'), reverseName, item.get('itemData')[reverseName]));
            });

          }, function (error) {
            // If item does not exist, proceed.
            Ember.Logger.warn('Could not find `%@:%@`, skipping reverse update.'.fmt(contentType.get('id'), itemId));
          });

        });

      };

      // Loop through removed relations, wait for each to process
      var removedRelationsCounter = 0;
      var removeRelation = function (item) {
        if (!item) {
          return;
        }
        return updateRelation(item, 'remove').then(function () {
          removedRelationsCounter += 1;
          return removeRelation(removedRelations.objectAt(removedRelationsCounter));
        });
      };
      relationPromises.pushObject(removeRelation(removedRelations.objectAt(removedRelationsCounter)));

      // Loop through added relations, wait for each to process
      var addedRelationsCounter = 0;
      var addRelation = function (item) {
        if (!item) {
          return;
        }
        return updateRelation(item, 'add').then(function () {
          addedRelationsCounter += 1;
          return addRelation(addedRelations.objectAt(addedRelationsCounter));
        });
      };
      relationPromises.pushObject(addRelation(addedRelations.objectAt(addedRelationsCounter)));

    });

    return Ember.RSVP.Promise.all(relationPromises);

  },

  saveItem: function () {

    var controller = this;

    ga('send', 'event', 'item', 'save');

    var controls = this.get('type.controls');

    // name field is special. it is validated as it changes.
    if (controls.findBy('name', 'name').get('widgetErrors.length')) {
      this.send('notify', 'danger', "Didn't save. Errors in form.");
      return;
    }

    // automatically update `update_date`
    controls.findBy('name', 'last_updated').set('value', moment().format('YYYY-MM-DDTHH:mm'));

    // sync publish date with controller
    if (!this.get('type.oneOff')) {
      controls.findBy('name', 'publish_date').set('value', this.get('publishDate'));
    }

    // set create_date if missing
    if (!controls.findBy('name', 'create_date').get('value')) {
      controls.findBy('name', 'create_date').set('value', moment().format('YYYY-MM-DDTHH:mm'));
    }

    // set preview_url if missing
    if (!controls.findBy('name', 'preview_url').get('value')) {
      controls.findBy('name', 'preview_url').set('value', uuid());
      this.set('previewUrl', controls.findBy('name', 'preview_url').get('value'));
    }

    if (Ember.isEmpty(this.get('itemModel'))) {
      this.set('itemModel', this.store.createRecord(this.get('model.itemModelName')));
    }

    // if all controls are valid update relationships then commit the item
    validateControls(this.get('type'))
      .then(this.updateReverseRelationships.bind(this))
      .then(this.commitItem.bind(this))
      .catch(function (error) {

        Ember.Logger.warn(error);

        controller.send('notify', 'danger', "There was an error while saving.");

      });

  },

  commitItem: function () {

    var controller = this;

    var itemModel = this.get('itemModel');

    var controls = this.get('type.controls');
    var itemData = dataFromControls(controls);

    itemData.isDraft = this.getWithDefault('isDraft', null);

    return itemModel.set('itemData', itemData).save().then(function (item) {

      controller.updateSlug();

      this.set('initialValues', controls.getEach('value'));

      controller.send('buildSignal', itemData.publish_date);

      var sendNotify = function (message) {
        controller.send('notify', 'info', message, { icon: 'ok-sign' });
      };

      // One Off
      if (this.get('type.oneOff')) {
        sendNotify('Saved. Initiating build.');
      }

      // Draft
      else if (itemData.isDraft) {
        sendNotify('Draft saved.');
      }

      // Live
      else if (itemData.publish_date && moment(itemData.publish_date).isBefore()) {
        sendNotify('Saved, initiating build.');
      }

      // Future
      else {
        sendNotify('Saved, will go live later.');
      }

      if (this.get('isNew')) {

        this.transitionToRoute('wh.content.type.edit', itemModel.get('id'));

      } else {

        // reset the initialRelations
        this.set('initialRelations', Ember.Object.create());
        this.get('type.controls').filterBy('controlType.widget', 'relation').forEach(function (control) {
          this.get('initialRelations').set(control.get('name'), Ember.copy(control.get('value')));
        }.bind(this));

      }

    }.bind(this));

  },

  actions: {
    saveItem: function () {
      this.saveItem();
    },

    saveDraft: function () {
      this.set('isDraft', true);
      this.set('publishDate', null);
      this.set('showSchedule', null);
      this.saveItem();
    },

    publishNow: function () {
      this.set('isDraft', null);
      this.set('publishDate', moment().format('YYYY-MM-DDTHH:mm'));
      this.saveItem();
    },

    publishFuture: function () {
      if (this.get('publishDate')) {
        this.set('isDraft', null);
        this.saveItem();
      } else {
        window.alert('Set a publish date');
      }
    },

    changePublishDate: function () {
      this.set('isDraft', null);
      this.set('publishDate', moment(this.get('type.controls').findBy('name', 'publish_date').get('value')).format('YYYY-MM-DDTHH:mm'));
      this.set('showSchedule', true);
    },

    setPublishNow: function () {
      this.set('publishDate', moment().format('YYYY-MM-DDTHH:mm'));
    },

    editSlug: function () {
      this.toggleProperty('isEditingSlug');
    }
  }
});
