export default Ember.ArrayController.extend({
  type: null,

  // items is the model
  // each item has fields
  // type has fields that has showInCms boolean
  // only show fields marked with showInCms
  cmsFields: function () {

    if (!this.get('type.fields')) {
      return;
    }

    var names = this.get('type.fields').filterBy('showInCms').getEach('name');

    this.forEach(function (item, index) {
      item.cmsFields = names.map(function (name) {
        return item[name];
      });
    });

    // return items;

  }.observes('@each'),

  actions: {
    deleteItem: function (item) {
      this.removeObject(item);
    }
  }

});
