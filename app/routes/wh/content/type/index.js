import getItemModelName from 'appkit/utils/model';

export default Ember.Route.extend({
  model: function () {
    var itemModelName = getItemModelName(this.modelFor('wh.content.type').get('name'));
    return this.store.find(itemModelName);
  },
  setupController: function (controller, model) {

    var contentType = this.modelFor('wh.content.type'),
        cmsControls = contentType.get('controls');

    // need to have these in the store to save later.
    // type.get('controls').mapBy('controlType');

    controller.set('cmsControls', cmsControls);
    controller.set('contentType', contentType);
    this._super.apply(this, arguments);
  }
});
