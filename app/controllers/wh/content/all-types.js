import getItemModelName from 'appkit/utils/model';

export default Ember.ArrayController.extend({
  actions: {
    deleteType: function (contentType) {
      if (window.confirm('Are you sure? Confirm to delete this type and all associated data.')) {
        // remove all associated data from Firebase
        window.ENV.firebase.child('data').child(contentType.get('id')).remove();

        // remove content type
        contentType.destroyRecord();
      }

    },
    gotoEdit: function (name) {
      this.transitionToRoute('form', name);
    }
  }
});
