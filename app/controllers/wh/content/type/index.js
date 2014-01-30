export default Ember.ArrayController.extend({
  type: null,
  cmsFieldNames: Ember.A([]),

  fieldsChanged: function () {

    window.console.log('fields');

    // this.set('cmsFieldNames', Ember.A([]));

    // this.get('type').get('fields').filterBy('showInCms').forEach(function (field) {
    //   this.get('cmsFieldNames').pushObject(field.get('name'));
    // });

  }.observes('type.fields.@each'),

  contentChanged: function () {

    window.console.log('content');

    this.get('content').forEach(function (item) {
      var fieldValues = [];
      this.get('cmsFieldNames').forEach(function (name) {
        fieldValues.push(item.get('data')[name]);
      });
      item.set('fields', fieldValues);
    }, this);

  }.observes('@each'),

  actions: {
    deleteItem: function (item) {
      item.destroyRecord();
    }
  }

});
