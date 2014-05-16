import getItemModelName from 'appkit/utils/model';

export default Ember.Route.extend({

  recordLimit: 10,

  beforeModel: function (transition) {
    var contentType = this.modelFor('wh.content.type');
    if (contentType.get('oneOff')) {
      this.transitionTo('wh.content.type.edit', contentType.get('id'));
    }
  },
  model: function () {
    var itemModelName = getItemModelName(this.modelFor('wh.content.type'));
    this.set('itemModelName', itemModelName);
    return this.store.find(itemModelName, { limit: this.get('recordLimit') });
  },
  setupController: function (controller, model) {

    controller.set('recordLimit', this.get('recordLimit'));
    controller.set('originalRecordLimit', this.get('recordLimit'));
    controller.set('itemModelName', this.get('itemModelName'));

    controller.set('contentType', this.modelFor('wh.content.type'));

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
