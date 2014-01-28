import ApplicationAdapter from 'appkit/adapters/application';

export default Ember.Route.extend({
  model: function () {

    var contentTypeName = Ember.String.singularize(this.modelFor('wh.content.type').get('name').toLowerCase()),
        modelName = contentTypeName.charAt(0).toUpperCase() + contentTypeName.slice(1);

    // Make a dynamic model/adapter so we can save data to `data/[modelName]`
    if (!window.App[modelName]) {

      // dynamic model
      window.App[modelName] = DS.Model.extend({
        data: DS.attr('json')
      });

      // dynamic adapter
      window.App[modelName + 'Adapter'] = ApplicationAdapter.extend({
        dbBucket: window.ENV.dbBucket + '/data/'
      });

    }

    return this.store.find(contentTypeName);
  },
  setupController: function (controller, model) {

    var type = this.modelFor('wh.content.type');

    type.get('fields').then(function (fields) {
      var cmsFieldNames = Ember.A([]);
      fields.filterBy('showInCms').forEach(function (field) {
        cmsFieldNames.pushObject(field.get('name'));
      });
      model.forEach(function (item) {
        var fieldValues = [];
        cmsFieldNames.forEach(function (name) {
          fieldValues.push(item.get('data')[name]);
        });
        item.set('fields', fieldValues);
      });
    });

    controller.set('contentType', type);
    this._super.apply(this, arguments);
  }
});
