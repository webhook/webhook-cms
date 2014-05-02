import getItemModelName from 'appkit/utils/model';

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

      Ember.Logger.info('Preparing to destroy `' + contentTypeName + '`');

      // remove relationships from related content types.
      // Note: I do not think we need to update the search index of related items as the data that's indexed is just IDs.
      Ember.Logger.info('Look for reverse relationships to remove.');
      contentType.get('controls').filterBy('controlType.widget', 'relation').forEach(function (control) {

        var relatedContentTypeId = control.get('meta.data.contentTypeId');
        var relatedControlName = control.get('meta.data.reverseName');

        Ember.Logger.info('Removing', relatedContentTypeId, ':', relatedControlName);

        var relationPromise = new Ember.RSVP.Promise(function (resolve, reject) {
          allTypesController.store.find('content-type', relatedContentTypeId).then(function (relatedContentType) {
            relatedContentType.get('controls').filterBy('name', relatedControlName).forEach(function (reverseControl) {
              relatedContentType.get('controls').removeObject(reverseControl);
              relatedContentType.save().then(function () {
                Ember.Logger.info('Removed', relatedContentTypeId, ':', relatedControlName);
                Ember.run(null, resolve);
              });
            });
          });
        });

        relationPromises.pushObject(relationPromise);

      });

      // When relations are done...
      Ember.RSVP.Promise.all(relationPromises).then(function () {

        Ember.Logger.info('Reverse relationships have been removed, proceeding to destroy `' + contentTypeName + '`');

        // Remove search index info for type
        window.ENV.deleteTypeIndex(contentType.get('id'));

        // remove all associated data from Firebase
        window.ENV.firebase.child('data').child(contentType.get('id')).remove(function () {
          Ember.Logger.info('Data for `' + contentTypeName + '` has been destroyed.');

          // remove content type
          contentType.destroyRecord().then(function () {
            Ember.Logger.info('`' + contentTypeName + '` has been destroyed.');
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
    }
  }
});
