import getItemModelName from 'appkit/utils/model';

export default Ember.Route.extend({
  beforeModel: function (transition) {
    var contentType = this.modelFor('wh.content.type');
    if (contentType.get('oneOff')) {
      this.transitionTo('wh.content.type.edit', contentType.get('id'));
    }
  },
  model: function () {
    var itemModelName = getItemModelName(this.modelFor('wh.content.type'));
    this.set('itemModelName', itemModelName);
    return this.store.find(itemModelName);
  },
  setupController: function (controller, model) {

    var contentType = this.modelFor('wh.content.type'),
        cmsControls = contentType.get('controls');

    controller.set('cmsControls', cmsControls);
    controller.set('columnChoices', cmsControls.rejectBy('name', 'preview_url'));
    controller.set('contentType', contentType);

    var lockedItems = Ember.A([]),
        lockedRef   = window.ENV.firebase.child('presence/locked').child(this.get('itemModelName'));

    var lockMap = Ember.Object.create();

    var lockedItem = function (snapshot) {
      lockMap.set(snapshot.name(), Ember.Object.create({
        id: snapshot.name(),
        email: snapshot.val()
      }));
      return lockMap.get(snapshot.name());
    };

    lockedRef.on('child_added', function (snapshot) {
      lockedItems.pushObject(lockedItem(snapshot));
    });

    lockedRef.on('child_removed', function (snapshot) {
      lockedItems.removeObject(lockMap.get(snapshot.name()));
    });

    controller.set('lockedItems', lockedItems);
    this.set('lockedRef', lockedRef);

    this._super.apply(this, arguments);

  },

  actions: {
    willTransition: function () {
      this.get('lockedRef').off();

      return true;
    }
  }
});
