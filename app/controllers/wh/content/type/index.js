export default Ember.ArrayController.extend({
  type: null,
  cmsFieldNames: Ember.A([]),

  fieldsChanged: function () {

    this.set('cmsFieldNames', Ember.A([]));

    this.get('contentType.fields').filterBy('showInCms').forEach(function (field) {
      this.get('cmsFieldNames').pushObject(field.get('name'));
    }, this);

    // Need fieldTypes in store for save later.
    this.get('contentType.fields').mapBy('fieldType');

    this._updateItemFields();

  }.observes('contentType.fields.@each.showInCms'),

  contentChanged: function () {
    this._updateItemFields();
  }.observes('@each'),

  _updateItemFields: function () {

    this.get('content').forEach(function (item) {
      var fieldValues = [];
      this.get('cmsFieldNames').forEach(function (name) {
        fieldValues.push(item.get('data')[name]);
      });
      item.set('fields', fieldValues);
    }, this);

  },

  actions: {
    deleteItem: function (item) {
      item.destroyRecord();
    },
    toggleShowInCms: function (field) {
      field.toggleProperty('showInCms');
      this.get('contentType').save();
    }
  }

});
