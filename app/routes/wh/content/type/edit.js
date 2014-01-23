export default Ember.Route.extend({
  model: function (params) {

    var model = this.get('store').createRecord('item');

    // there has to be a better way to get the type. :(
    var path_parts = this.modelFor('wh.content.type').get('ref.path.m'),
        type = path_parts[path_parts.length - 1];

    var typeRef = this.modelFor('wh.content.type').get('ref');

    typeRef.once('value', function (snapshot) {
      window.console.log('type', snapshot.val());
    });

    var itemRef = new Firebase(window.ENV.firebase + "data/" + type + "/" + params.id);

    itemRef.once('value', function (snapshot) {
      window.console.log('item', snapshot.val());
    });

    return model;

    // // there has to be a better way to get the type. :(
    // var path_parts = this.modelFor('wh.content.type').get('ref.path.m'),
    //     type = path_parts[path_parts.length - 1];
    // return EmberFire.Object.create({
    //   ref: new Firebase(window.ENV.firebase + "data/" + type + "/" + params.id)
    // });
  },
  setupController: function (controller, model) {
    controller.set('type', this.modelFor('wh.content.type'));
    this._super.apply(this, arguments);
  }
});
