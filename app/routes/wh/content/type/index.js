import getItemModelName from 'appkit/utils/model';

export default Ember.Route.extend({
  // beforeModel: function () {
  //   var contentType = this.modelFor('wh.content.type');
  //   if (contentType.get('oneOff')) {
  //     // check if there is data

  //     // if no data, send to create page
  //     this.transitionTo('wh.content.type.new', contentType);
  //   }
  // },
  model: function () {
    var itemModelName = getItemModelName(this.modelFor('wh.content.type'));
    return this.store.find(itemModelName);
  },
  setupController: function (controller, model) {

    var contentType = this.modelFor('wh.content.type'),
        cmsControls = contentType.get('controls');

    controller.set('cmsControls', cmsControls);
    controller.set('contentType', contentType);

    this._super.apply(this, arguments);
  }
});
