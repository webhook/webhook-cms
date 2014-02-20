import getItemModelName from 'appkit/utils/model';

export default Ember.Route.extend({
  beforeModel: function () {
    var contentType = this.modelFor('wh.content.type');
    if (contentType.get('oneOff')) {
      return this.store.find('data', contentType.get('id')).then(function (type) {
        this.transitionTo('wh.content.type.edit', type);
      }.bind(this));
    }
  },
  model: function () {
    return this.store.find(getItemModelName(this.modelFor('wh.content.type')));
  },
  setupController: function (controller, model) {

    var contentType = this.modelFor('wh.content.type'),
        cmsControls = contentType.get('controls');

    controller.set('cmsControls', cmsControls);
    controller.set('contentType', contentType);

    this._super.apply(this, arguments);
  }
});
