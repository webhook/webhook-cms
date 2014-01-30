import getItemModelName from 'appkit/utils/model';

export default Ember.Route.extend({
  model: function () {
    var itemModelName = getItemModelName(this.modelFor('wh.content.type').get('name'));
    return this.store.find(itemModelName);
  },
  setupController: function (controller, model) {

    var type = this.modelFor('wh.content.type'),
        cmsFieldNames = Ember.A([]);

    type.get('fields').filterBy('showInCms').forEach(function (field) {
      cmsFieldNames.pushObject(field.get('name'));
    });

    controller.set('cmsFieldNames', cmsFieldNames);
    controller.set('contentType', type);
    this._super.apply(this, arguments);
  }
});
