import SearchIndex from 'appkit/utils/search-index';

export default Ember.ArrayController.extend({

  sortProperties: ['name'],

  actions: {
    deleteType: function (contentType) {
      if (!window.confirm('Are you sure? Confirm to delete this type and all associated data.')) {
        return;
      }

      var allTypesController = this;

      var relationPromises = Ember.A([]);

      var contentTypeName = contentType.get('name');

      Ember.Logger.log('Preparing to destroy `%@`.'.fmt(contentTypeName));

      // remove relationships from related content types.
      // Note: I do not think we need to update the search index of related items as the data that's indexed is just IDs.
      var relationControls = contentType.get('controls').filterBy('controlType.widget', 'relation');

      Ember.Logger.log('Removing %@ reverse relationships.'.fmt(relationControls.get('length')));

      relationControls.forEach(function (control) {

        var relatedContentTypeId = control.get('meta.contentTypeId');
        var relatedControlName = control.get('meta.reverseName');

        Ember.Logger.log('Removing', relatedContentTypeId, ':', relatedControlName);

        var relationPromise = new Ember.RSVP.Promise(function (resolve, reject) {
          allTypesController.store.find('content-type', relatedContentTypeId).then(function (relatedContentType) {
            relatedContentType.get('controls').filterBy('name', relatedControlName).forEach(function (reverseControl) {
              relatedContentType.get('controls').removeObject(reverseControl);
              relatedContentType.save().then(function () {
                Ember.Logger.log('Removed', relatedContentTypeId, ':', relatedControlName);
                resolve();
              });
            });
          });
        });

        relationPromises.pushObject(relationPromise);

      });

      // Remove relation controls from grid controls
      var gridRelationPromises = Ember.A([]);
      var deletedContentTypeId = contentType.get('id');

      gridRelationPromises.pushObject(allTypesController.store.find('content-type').then(function (contentTypes) {
        contentTypes.rejectBy('id', deletedContentTypeId).forEach(function (contentType) {
          var controls = contentType.get('controls');
          var gridControls = controls.filterBy('controlType.widget', 'grid');
          gridControls.forEach(function (gridControl) {
            var relatedControls = gridControl.get('controls')
                                    .filterBy('controlType.widget', 'relation')
                                    .filterBy('meta.contentTypeId', deletedContentTypeId);
            gridControl.get('controls').removeObjects(relatedControls);
            gridControl.transitionTo('updated.uncommitted');
          });
          gridRelationPromises.pushObject(contentType.save());
        });
      }));

      // When relations are done...
      Ember.RSVP.Promise.all(relationPromises, gridRelationPromises).then(function () {

        Ember.Logger.log('Reverse relationships have been removed, proceeding to destroy `%@`.'.fmt(contentTypeName));

        // Remove search index info for type
        SearchIndex.deleteType(contentType);

        // remove all associated data from Firebase
        window.ENV.firebase.child('data').child(contentType.get('id')).remove(function () {
          Ember.Logger.log('Data for `%@` has been destroyed.'.fmt(contentTypeName));

          // remove content type
          contentType.destroyRecord().then(function () {
            Ember.Logger.log('`%@` has been destroyed.'.fmt(contentTypeName));
          });
        });

      });
    },
    gotoEdit: function (name) {
      this.transitionToRoute('form', name);
    },
    toggleSort: function (property) {
      if (this.get('sortProperties.firstObject') === property) {
        this.toggleProperty('sortAscending');
      } else {
        this.set('sortProperties', [property]);
        this.set('sortAscending', true);
      }
    },

    scaffoldType: function (contentType) {

      if (!window.confirm('Are you sure? Confirm to rebuild scaffolding for this content type.')) {
        return;
      }

      var controller = this;

      Ember.Logger.info('Building scaffolding for', contentType.get('id'));

      return new Ember.RSVP.Promise(function (resolve, reject) {

        controller.send('gruntCommand', 'scaffolding_force:' + contentType.get('id'), function (data) {

          Ember.Logger.info('Scaffolding built for', contentType.get('id'));

          if (data && typeof data === 'object') {
            contentType.set('individualMD5', data.individualMD5);
            contentType.set('listMD5', data.listMD5);
            contentType.set('oneOffMD5', data.oneOffMD5);
            contentType.save();
          }
          controller.send('notify', 'success', 'Scaffolding for ' + contentType.get('name') + ' built.');
          Ember.run(null, resolve);

        });

      });

    }
  }
});
