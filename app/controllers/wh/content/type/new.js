import ApplicationAdapter from 'appkit/adapters/application';

export default Ember.ObjectController.extend({
  actions: {
    createItem: function () {

      var data = {};

      this.get('model.fields').filterBy('value').forEach(function (field) {
        data[field.get('name')] = field.get('value');
      });

      var contentTypeName = Ember.String.singularize(this.get('model.name').toLowerCase()),
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

      this.store.createRecord(contentTypeName, {
        data: data
      }).save().then(function () {
        this.transitionToRoute('wh.content.type', this.get('model'));
      }.bind(this));

    }
  }
});
