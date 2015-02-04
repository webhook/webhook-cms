import SearchIndex from 'appkit/utils/search-index';

export default Ember.ArrayController.extend({

  sortProperties: ['name'],

  actions: {
    deleteType: function (contentType) {
      if (!window.confirm('Are you sure? Confirm to delete this type and all associated data.')) {
        return;
      }

      contentType.destroyRecord();
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
