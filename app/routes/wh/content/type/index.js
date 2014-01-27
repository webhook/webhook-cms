import ApplicationAdapter from 'appkit/adapters/application';

export default Ember.Route.extend({
  model: function () {

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

    return this.store.find(contentTypeName);

    // var model = Ember.A([]),
    //     cmsFields = Ember.A([]);

    // // there has to be a better way to get the type. :(
    // var path_parts = this.modelFor('wh.content.type').get('ref.path.m'),
    //     type = path_parts[path_parts.length - 1],
    //     ref = new Firebase(window.ENV.firebase + "data/" + type);

    // ref.on('child_added', function (snapshot) {
    //   if (snapshot.name() === "_type") {
    //     return;
    //   }

    //   var item = Ember.Object.create(snapshot.val());
    //   item.set('cmsFields', Ember.A([]));

    //   cmsFields.forEach(function (fieldName) {
    //     item.get('cmsFields').pushObject(item.get(fieldName));
    //   });

    //   model.pushObject(item);
    // });

    // var typeRef = new Firebase(window.ENV.firebase + "content_types/" + type  + "/fields");
    // typeRef.on('child_added', function (snapshot) {
    //   if (snapshot.name() === "_type" || !snapshot.val().showInCms) {
    //     return;
    //   }
    //   var fieldName = snapshot.val().name;

    //   model.forEach(function (item) {
    //     item.get('cmsFields').pushObject(item.get(fieldName));
    //   });

    //   cmsFields.pushObject(fieldName);
    // });

    // return model;
  },
  setupController: function (controller, model) {
    controller.set('type', this.modelFor('wh.content.type'));
    this._super.apply(this, arguments);
  }
});
