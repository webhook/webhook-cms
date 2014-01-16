export default Ember.Route.extend({
  model: function (params) {
    return EmberFire.Object.create({
      ref: new Firebase(window.ENV.firebase + "content_types/" + params.type)
    });
  // },
  // setupController: function (controller, model) {

  //   window.console.log('')

  //   var type = model.get('ref.path.m').pop();

  //   this.set('contentType', EmberFire.Object.create({
  //     ref: new Firebase(window.ENV.firebase + "content_types/" + type)
  //   }));

  //   this._super.apply(this, arguments);
  }
});
