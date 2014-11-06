export default DS.FirebaseAdapter.extend({
  firebase: window.ENV.firebase,

  init: function () {
    this._super.apply(this, arguments);
    this._findQueryMapForType = {};
  },

  // basic support for Firebase queries
  // - orderBy
  // - limitToFirst
  // - limitToLast
  // - startAt
  // - endAt
  findQuery: function(store, type, query) {

    var adapter = this;
    var ref = this._getRef(type);

    query = query || {};

    if (query.orderBy) {
      ref = ref.orderByChild(query.orderBy);
    }

    if (query.limit) {
      if (query.desc) {
        ref = ref.limitToLast(query.limit);
      } else {
        ref = ref.limitToFirst(query.limit);
      }
    }

    if (query.startAt) {
      ref = query.startAt === true ? ref.startAt() : ref.startAt(query.startAt);
    }

    if (query.endAt) {
      ref = query.endAt === true ? ref.endAt() : ref.endAt(query.endAt);
    }

    return new Ember.RSVP.Promise(function(resolve, reject) {

      // Listen for child events on the type
      var valueEventTriggered;
      if (!adapter._findQueryHasEventsForType(type, query)) {
        valueEventTriggered = adapter._findQueryAddEventListeners(store, type, ref, query);
      }
      ref.once('value', function(snapshot) {
        var results = [];
        if (valueEventTriggered) {
          Ember.run(null, valueEventTriggered.resolve);
        }
        if (snapshot.val() === null) {
          adapter._enqueue(resolve, [results]);
        }
        else {
          snapshot.forEach(function(childSnapshot) {
            var payload = adapter._assignIdToPayload(childSnapshot);
            adapter._updateRecordCacheForType(type, payload);
            results.push(payload);
          });
          adapter._enqueue(resolve, [results]);
        }
      }, function(error) {
        adapter._enqueue(reject, [error]);
      });

    }, Ember.String.fmt('DS: FirebaseAdapter#findQuery %@, %@ to %@', [type, JSON.stringify(query), ref.toString()]));

  },


  /**
    Keep track of what types `.findQuery()` has been called for
    so duplicate listeners aren't added
  */
  _findQueryMapForType: undefined,

  /**
    Determine if the current type is already listening for children events
  */
  _findQueryHasEventsForType: function(type, query) {
    return !Ember.isNone(this._findQueryMapForType[type + JSON.stringify(query)]);
  },

  /**
    After `.findQuery()` is called on a type, continue to listen for
    `child_added`, `child_removed`, and `child_changed`
  */
  _findQueryAddEventListeners: function(store, type, ref, query) {
    this._findQueryMapForType[type + JSON.stringify(query)] = true;

    var deferred = Ember.RSVP.defer();
    var adapter = this;
    var serializer = store.serializerFor(type);
    var valueEventTriggered = false;

    deferred.promise.then(function() {
      valueEventTriggered = true;
    });

    ref.on('child_added', function(snapshot) {
      if (!valueEventTriggered) { return; }
      adapter._handleChildValue(store, type, serializer, snapshot);
    });

    ref.on('child_changed', function(snapshot) {
      if (!valueEventTriggered) { return; }
      adapter._handleChildValue(store, type, serializer, snapshot);
    });

    ref.on('child_removed', function(snapshot) {
      if (!valueEventTriggered) { return; }
      snapshot.ref().once('value', function (snapshot) {
        if (snapshot.val() === null) {
          var record = store.getById(type, snapshot.key());
          if (record && !record.get('isDeleted')) {
            adapter._enqueue(function() {
              store.deleteRecord(record);
            });
          }
        }
      });
    });

    return deferred;
  }

});
