import ApplicationAdapter from 'appkit/adapters/application';

var fmt = Ember.String.fmt;

export default ApplicationAdapter.extend({
  // There is only one small section of code that is replaced from
  // https://github.com/firebase/emberfire/blob/32eb70e49afd7726949776342ed547c5bf1399d2/src/data.js
  updateRecord: function(store, type, record, _recordRef) {
    var adapter = this;
    var recordRef = _recordRef || this._getRef(type, record.id);
    var recordCache = Ember.get(adapter._recordCacheForType, fmt('%@.%@', [type.typeKey, record.get('id')])) || {};

    var serializedRecord = record.serialize({includeId:false});

    return new Promise(function(resolve, reject) {
      var savedRelationships = Ember.A();
      record.eachRelationship(function(key, relationship) {
        var save;
        if (relationship.kind === 'hasMany') {
            if (serializedRecord[key]) {

              // We want to keep control priority so save as array
              serializedRecord[key] = serializedRecord[key].map(function (id) {
                return store.getById(relationship.type.typeKey, id).serialize();
              });

              // Original emberFire as follows
              // save = adapter._saveHasManyRelationship(store, type, relationship, serializedRecord[key], recordRef, recordCache);
              // savedRelationships.push(save);
              // // Remove the relationship from the serializedRecord because otherwise we would clobber the entire hasMany
              // delete serializedRecord[key];
            }
        } else {
            if (relationship.options.embedded === true && serializedRecord[key]) {
              save = adapter._saveBelongsToRecord(store, type, relationship, serializedRecord[key], recordRef);
              savedRelationships.push(save);
              delete serializedRecord[key];
            }
        }
      });

      var relationshipsPromise = Ember.RSVP.allSettled(savedRelationships);
      var recordPromise = adapter._updateRecord(recordRef, serializedRecord);

      Ember.RSVP.hashSettled({relationships: relationshipsPromise, record: recordPromise}).then(function(promises) {
        var rejected = Ember.A(promises.relationships.value).filterBy('state', 'rejected');
        if (promises.record.state === 'rejected') {
          rejected.push(promises.record);
        }
        // Throw an error if any of the relationships failed to save
        if (rejected.length !== 0) {
          var error = new Error(fmt('Some errors were encountered while saving %@ %@', [type, record.id]));
              error.errors = rejected.mapBy('reason');
          reject(error);
        } else {
          resolve();
        }
      });
    }, fmt('DS: FirebaseAdapter#updateRecord %@ to %@', [type, recordRef.toString()]));
  }
});
