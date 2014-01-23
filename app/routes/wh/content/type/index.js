export default Ember.Route.extend({
  model: function () {

    var model = Ember.A([]),
        cmsFields = Ember.A([]);

    // there has to be a better way to get the type. :(
    var path_parts = this.modelFor('wh.content.type').get('ref.path.m'),
        type = path_parts[path_parts.length - 1],
        ref = new Firebase(window.ENV.firebase + "data/" + type);

    ref.on('child_added', function (snapshot) {
      if (snapshot.name() === "_type") {
        return;
      }

      var item = Ember.Object.create(snapshot.val());
      item.set('cmsFields', Ember.A([]));

      cmsFields.forEach(function (fieldName) {
        item.get('cmsFields').pushObject(item.get(fieldName));
      });

      model.pushObject(item);
    });

    var typeRef = new Firebase(window.ENV.firebase + "content_types/" + type  + "/fields");
    typeRef.on('child_added', function (snapshot) {
      if (snapshot.name() === "_type" || !snapshot.val().showInCms) {
        return;
      }
      var fieldName = snapshot.val().name;

      model.forEach(function (item) {
        item.get('cmsFields').pushObject(item.get(fieldName));
      });

      cmsFields.pushObject(fieldName);
    });

    return model;
  },
  setupController: function (controller, model) {
    controller.set('type', this.modelFor('wh.content.type'));
    this._super.apply(this, arguments);
  }
});
