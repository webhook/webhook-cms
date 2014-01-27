import ApplicationAdapter from 'appkit/adapters/application';

export default Ember.Route.extend({
  model: function (params) {

    var contentTypeName = this.modelFor('wh.content.type').get('name').toLowerCase(),
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

    return this.store.find(contentTypeName, params.item_id);
  },
  setupController: function (controller, model) {

    var data = model.get('data'),
        type = this.modelFor('wh.content.type');

    type.get('fields').then(function (fields) {
      fields.forEach(function (field) {
        field.set('value', data[field.get('name')]);
      });
    });

    controller.set('type', type);
    this._super.apply(this, arguments);
  }
});
