import getItemModelName from 'appkit/utils/model';

export default Ember.Route.extend({
  model: function () {
    var itemModelName = getItemModelName(this.modelFor('wh.content.type').get('name'));
    return this.store.find(itemModelName);
  },
  setupController: function (controller, model) {

    var type = this.modelFor('wh.content.type'),
        cmsControlNames = Ember.A([]);

    type.get('controls').filterBy('showInCms').forEach(function (control) {
      cmsControlNames.pushObject(control.get('name'));
    });

    // need to have these in the store to save later.
    type.get('controls').mapBy('controlType');

    controller.set('cmsControlNames', cmsControlNames);
    controller.set('contentType', type);
    this._super.apply(this, arguments);
  }
});
