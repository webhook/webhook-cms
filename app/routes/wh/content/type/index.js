import getItemModelName from 'appkit/utils/model';

export default Ember.Route.extend({

  recordLimit: 50,

  beforeModel: function (transition) {
    var contentType = this.modelFor('wh.content.type');
    if (contentType.get('oneOff')) {
      this.transitionTo('wh.content.type.edit', contentType.get('id'));
    }
    this.set('contentType', contentType);

    // make sure all control types are available
    return this.store.find('control-type');
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

    controller.set('filterQuery', '');

    controller.set('contentType', this.get('contentType'));

    var lockedItems = Ember.A([]),
        lockedRef   = window.ENV.firebase.child('presence/locked').child(this.get('itemModelName'));

    var lockMap = Ember.Object.create();

    var lockedItem = function (snapshot) {
      lockMap.set(snapshot.key(), Ember.Object.create({
        id: snapshot.key(),
        email: snapshot.val().email
      }));
      return lockMap.get(snapshot.key());
    };

    lockedRef.on('child_added', function (snapshot) {
      var lock = snapshot.val();
      var diff = moment(lock.time).diff(moment());
      if (diff < 0) {
        snapshot.ref().remove();
      } else {
        lockedItems.pushObject(lockedItem(snapshot));
      }
    });

    lockedRef.on('child_removed', function (snapshot) {
      lockedItems.removeObject(lockMap.get(snapshot.key()));
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
