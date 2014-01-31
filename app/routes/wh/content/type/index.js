import getItemModelName from 'appkit/utils/model';

export default Ember.Route.extend({
  model: function () {
    var itemModelName = getItemModelName(this.modelFor('wh.content.type').get('name'));
    return this.store.find(itemModelName);
  },
  setupController: function (controller, model) {

    var type = this.modelFor('wh.content.type'),
        cmsControls = type.get('controls').filterBy('showInCms');

    // need to have these in the store to save later.
    // type.get('controls').mapBy('controlType');

    controller.set('cmsControls', cmsControls);
    controller.set('contentType', type);
    this._super.apply(this, arguments);
  }
});
