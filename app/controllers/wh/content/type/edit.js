/*globals ga*/
import getItemModelName from 'appkit/utils/model';
import validateControls from 'appkit/utils/validators';
import dataFromControls from 'appkit/utils/controls';
import uuid from 'appkit/utils/uuid';
import SearchIndex from 'appkit/utils/search-index';

export default Ember.ObjectController.extend({
  type        : null,
  lastUpdated : null,
  createDate  : null,
  isDraft     : null,
  publishDate : null,
  showSchedule: false,
  itemModel   : null,
  previewUrl  : null,
  initialRelations: Ember.Object.create(),
  initialValues: Ember.A([]),

  nameControl: null,
  slugControl: null,

  isEditingSlug: false,

  defaultSlug: null,

  fullPreviewUrl: function () {

    if(this.get('previewUrl') === null) {
      this.set('previewUrl', this.get('type.controls').findBy('name', 'preview_url').get('value'));
    }

    if(!this.get('previewUrl')) {
      return null;
    }

    return '/_wh_previews/' + this.get('type.id') + '/' + this.get('previewUrl') + '/';

  }.property('previewUrl'),

  setDefaultSlug: function () {

    if (Ember.isEmpty(this.get('nameControl.value'))) {
      this.set('defaultSlug', null);
      return;
    }

    var defaultContentTypeSlug = (this.get('type.customUrls.listUrl') || this.get('type.id')) + '/';

    if (!Ember.isEmpty(this.get('type.customUrls.individualUrl'))) {
      defaultContentTypeSlug += this.get('type.customUrls.individualUrl') + '/';
    }

    var controller = this;

    window.ENV.sendGruntCommand('generate_slug:%@'.fmt(JSON.stringify(this.get('nameControl.value'))), function (slug) {
      controller.set('defaultSlug', defaultContentTypeSlug + slug);
    });

  }.observes('nameControl.value', 'type.customUrls.individualUrl', 'type.customUrls.listUrl'),

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

  updateReverseRelationships: function (itemModel) {

    var editItemController = this;

    var relationControls = this.get('type.controls').filterBy('controlType.widget', 'relation');

    Ember.Logger.info('Updating reverse relationships (%@).'.fmt(relationControls.get('length')));

    relationControls.filterBy('controlType.widget', 'relation').forEach(function (control) {

      var currentRelations = control.get('value') || Ember.A([]);
      var initialRelations = this.get('initialRelations').get(control.get('name')) || Ember.A([]);

      // added relations is temporarily all values so that
      // var addedRelations = Ember.$(currentRelations).not(initialRelations).get();
      var addedRelations = currentRelations;
      var removedRelations = Ember.$(initialRelations).not(currentRelations).get();

      Ember.Logger.info('`' + control.get('name') + '` added ' + addedRelations.get('length') + ' and removed ' + removedRelations.get('length') + ' relationships');

      var updateRelation = function (relatedItem, updateType) {

        var contentTypeId = relatedItem.split(' ')[0];
        var itemId = relatedItem.split(' ')[1];
        var relatedValue = this.get('type.id') + ' ' + itemModel.get('id');

        return this.store.find('contentType', contentTypeId).then(function (contentType) {
          var modelName = getItemModelName(contentType);
          var foreignControls = contentType.get('controls');
          var reverseControl = control.get('meta.reverseName') && foreignControls.filterBy('name', control.get('meta.reverseName')).get('firstObject');

          // Legacy support
          // If we don't have a reverse relationship, add it.
          new Ember.RSVP.Promise(function (resolve, reject) {

            if (reverseControl) {
              Ember.Logger.log('Reverse control found for `' + control.get('name') + '` on `' + contentType.get('name') + '`, proceeding.');
              Ember.run(null, resolve);
            } else {
              Ember.Logger.log('Reverse control NOT found for `' + control.get('name') + '` on `' + contentType.get('name') + '`, creating it.');

              this.store.find('control-type', 'relation').then(function (controlType) {

                var reverseControl = this.store.createRecord('control', {
                  label      : this.get('type.name'),
                  controlType: controlType,
                  meta: Ember.Object.create({
                    contentTypeId: this.get('type.id'),
                    reverseName: control.get('name')
                  })
                });

                Ember.Logger.log('Setting new reverse control label to `' + reverseControl.get('label') + '`');

                // The new reverse relation control must have a unique name
                var counter = 1, counterName;
                while (foreignControls.getEach('name').indexOf(reverseControl.get('name')) >= 0) {
                  counter = counter + 1;
                  counterName = this.get('type.name') + ' ' + counter;
                  Ember.Logger.log('Duplicate control name detected, setting to `' + counterName + '`');
                  reverseControl.set('label', counterName);
                }

                foreignControls.addObject(reverseControl);

                // update near side contentType relation control with reverse name.
                control.set('meta.reverseName', reverseControl.get('name'));
                this.get('type').save().then(function () {

                  // update far side contentType relation control
                  contentType.save().then(function (contentType) {
                    Ember.Logger.info('Reverse relationship of `' + control.get('name') + '` to `' + reverseControl.get('name') + '` successfully added.');
                    Ember.run(null, resolve);
                  }, function (error) {
                    Ember.run(null, reject, error);
                  });

                }, function (error) {
                  Ember.run(null, reject, error);
                });

              }.bind(this));
            }

          }.bind(this)).then(function () {

            // Find and update reverse item.
            return this.store.find(modelName, itemId).then(function (item) {

              if (reverseControl.get('meta.isSingle')) {

                if (updateType === 'remove') {
                  item.get('itemData')[control.get('meta.reverseName')] = null;
                } else {
                  item.get('itemData')[control.get('meta.reverseName')] = relatedValue;
                }

              } else {

                var currentItems = item.get('itemData')[control.get('meta.reverseName')];

                if (Ember.isEmpty(currentItems)) {
                  currentItems = Ember.A([]);
                }

                if (updateType === 'remove') {
                  currentItems.removeObject(relatedValue);
                } else {
                  currentItems.addObject(relatedValue);
                }

                item.get('itemData')[control.get('meta.reverseName')] = currentItems;

              }
              return item.save().then(function () {
                Ember.Logger.log('`' + item.get('itemData.name') + '` updated.');
              });
            }.bind(this));

          }.bind(this), function (error) {

            Ember.Logger.error(error);
            if (window.trackJs) {
              window.trackJs.log("Attempted to save form.", itemModel);
              window.trackJs.track(error);
            }
            this.send('notify', 'danger', 'Error saving relationship.');

          }.bind(this));

        }.bind(this));

      }.bind(this);

      // Loop through removed relations, wait for each to process
      var removedRelationsCounter = 0;
      var removeRelation = function (item) {
        if (!item) {
          return;
        }
        updateRelation.call(this, item, 'remove').then(function () {
          removedRelationsCounter += 1;
          removeRelation.call(this, removedRelations.objectAt(removedRelationsCounter));
        });
      };
      removeRelation(removedRelations.objectAt(removedRelationsCounter));

      // Loop through added relations, wait for each to process
      var addedRelationsCounter = 0;
      var addRelation = function (item) {
        if (!item) {
          return;
        }
        updateRelation.call(this, item, 'add').then(function () {
          addedRelationsCounter += 1;
          addRelation.call(this, addedRelations.objectAt(addedRelationsCounter));
        });
      };
      addRelation(addedRelations.objectAt(addedRelationsCounter));

    }.bind(this));

  },

  saveItem: function () {

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
    controls.findBy('name', 'publish_date').set('value', this.get('publishDate'));

    // set create_date if missing
    if (!controls.findBy('name', 'create_date').get('value')) {
      controls.findBy('name', 'create_date').set('value', moment().format('YYYY-MM-DDTHH:mm'));
    }

    // set preview_url if missing
    if (!controls.findBy('name', 'preview_url').get('value')) {
      controls.findBy('name', 'preview_url').set('value', uuid());
      this.set('previewUrl', controls.findBy('name', 'preview_url').get('value'));
    }

    validateControls(this.get('type'), this.get('itemModel')).then(this.commitItem.bind(this));

  },

  commitItem: function () {

    var controls = this.get('type.controls');

    if (controls.isAny('widgetIsValid', false)) {
      this.send('notify', 'danger', "Didn't save. Errors in form.");
      return;
    }

    var itemData = dataFromControls(controls);

    itemData.isDraft = this.getWithDefault('isDraft', null);

    var itemModel = this.get('itemModel') || this.store.createRecord(getItemModelName(this.get('model')));

    this.updateReverseRelationships(itemModel);

    itemModel.set('itemData', itemData).save().then(function (item) {

      this.set('initialValues', controls.getEach('value'));

      window.ENV.sendBuildSignal(itemData.publish_date);

      SearchIndex.indexItem(item, this.get('type'));

      // One Off
      if (this.get('type.oneOff')) {
        this.send('notify', 'info', 'Saved. Initiating build.', {
          icon: 'ok-sign'
        });
      }

      // Draft
      else if (itemData.isDraft) {
        this.send('notify', 'info', 'Draft saved', {
          icon: 'ok-sign'
        });
      }

      // Live
      else if (itemData.publish_date && moment(itemData.publish_date).isBefore()) {
        this.send('notify', 'info', 'Saved. Initiating build.', {
          icon: 'ok-sign'
        });
      }

      // Future
      else {
        this.send('notify', 'info', 'Saved, will go live later', {
          icon: 'ok-sign'
        });
      }

      if (!this.get('itemModel')) {
        this.transitionToRoute('wh.content.type.edit', itemModel.get('id'));
      } else {

        // reset the initialRelations
        this.set('initialRelations', Ember.Object.create());
        this.get('type.controls').filterBy('controlType.widget', 'relation').forEach(function (control) {
          this.get('initialRelations').set(control.get('name'), Ember.copy(control.get('value')));
        }.bind(this));

      }

    }.bind(this), function (error) {
      Ember.Logger.error(error);
      if (window.trackJs) {
        window.trackJs.log("Attempted to save item.", itemModel);
        window.trackJs.track(error);
      }
      this.send('notify', 'danger', 'There was an error while saving.');
    }.bind(this));

  },

  actions: {
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
      this.set('publishDate', moment().format('YYYY-MM-DDTHH:mm'));
      this.set('showSchedule', true);
    },

    setPublishNow: function () {
      this.set('publishDate', moment().format('YYYY-MM-DDTHH:mm'));
    },

    removeTabularRow: function (row, control) {
      control.get('value').removeObject(row);
    },

    addTabularRow: function (control) {
      var emptyRow = Ember.A([]);
      control.get('meta.options').forEach(function () {
        emptyRow.pushObject(Ember.Object.create());
      });
      control.get('value').pushObject(emptyRow);
    },

    editSlug: function () {
      this.toggleProperty('isEditingSlug');
    },

    forceSlug: function () {
      if (!Ember.isEmpty(this.get('slugControl.value'))) {
        var controller = this;
        window.ENV.sendGruntCommand('generate_slug:%@'.fmt(JSON.stringify(this.get('slugControl.value'))), function (slug) {
          controller.set('slugControl.value', slug);
        });
      }
    }
  }
});
