import ApplicationAdapter from 'appkit/adapters/application';

var fmt = Ember.String.fmt;

export default ApplicationAdapter.extend({
  updateRecord: function(store, type, record) {
    var adapter = this;
    var recordRef = this._getRef(type, record.id);
    var recordCache = Ember.get(adapter._recordCacheForType, fmt('%@.%@', [type.typeKey, record.get('id')])) || {};

    return this._getSerializedRecord(record).then(function(serializedRecord) {
      return new Ember.RSVP.Promise(function(resolve, reject) {
        var savedRelationships = Ember.A();
        record.eachRelationship(function(key, relationship) {
          var save ;
          switch (relationship.kind) {
            case 'hasMany':
              if (Ember.isArray(serializedRecord[key])) {

                // THIS IS THE ONLY PART THAT IS DIFFERENT FROM EMBERFIRE
                serializedRecord[key] = serializedRecord[key].map(function (id) {
                  return store.getById(relationship.type.typeKey, id).serialize();
                });
                // END ONLY DIFFERENCE

              }
              break;
            case 'belongsTo':
              if (typeof serializedRecord[key] === "undefined" || serializedRecord[key] === null || serializedRecord[key] === '') {
                delete serializedRecord[key];
              }
              else if (relationship.options.embedded === true) {
                save = adapter._saveBelongsToRecord(store, type, relationship, serializedRecord[key], recordRef);
                savedRelationships.push(save);
                delete serializedRecord[key];
              }
              break;
            default:
              break;
          }
        });
        // Save the record once all the relationships have saved
        Ember.RSVP.allSettled(savedRelationships).then(function(savedRelationships) {
          savedRelationships = Ember.A(savedRelationships);
          var rejected = Ember.A(savedRelationships.filterBy('state', 'rejected'));
          // Throw an error if any of the relationships failed to save
          if (rejected.get('length') !== 0) {
            var error = new Error(fmt('Some errors were encountered while saving %@ %@', [type, record.id]));
                error.errors = rejected.mapBy('reason');
            adapter._enqueue(reject, [error]);
          }
          recordRef.update(serializedRecord, function(error) {
            if (error) {
              adapter._enqueue(reject, [error]);
            } else {
              adapter._enqueue(resolve);
            }
          });
        });
      });
    }, fmt('DS: FirebaseAdapter#updateRecord %@ to %@', [type, recordRef.toString()]));
  }
});
