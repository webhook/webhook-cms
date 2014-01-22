export default Ember.ArrayController.extend({
  ref: null,
  newType: null,

  actions: {
    createType: function () {
      var self = this,
          contentType = this.get('newType');

      this.get('ref').child(contentType.get('name')).set(contentType.serialize(), function (error) {
        if (error) {
        } else {
          self.transitionTo('form', contentType.get('name'));
        }
      });

    },
    deleteType: function (contentType) {
      this.removeObject(contentType);
    },
    gotoEdit: function (name) {
      this.transitionTo('form', name);
    }
  }
});
