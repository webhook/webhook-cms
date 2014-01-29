import ApplicationSerializer from 'appkit/serializers/application';
import uuid from 'appkit/utils/uuid';

export default ApplicationSerializer.extend({ // or DS.RESTSerializer
  serializeHasMany: function(record, json, relationship) {
    var key = relationship.key,
        hasManyRecords = Ember.get(record, key);

    // Embed hasMany relationship if records exist
    if (hasManyRecords && relationship.options.embedded === 'always') {
      json[key] = [];
      hasManyRecords.forEach(function(item, index){
        var data = item.serialize();
        // data.id = data.id || uuid();
        json[key].push(data);
      });
    }
    // Fallback to default serialization behavior
    else {
      return this._super(record, json, relationship);
    }
  },
  serializeBelongsTo: function(record, json, relationship) {
    var key = relationship.key,
        belongsToRecord = Ember.get(record, key);

    if (relationship.options.embedded === 'always') {
      var data = belongsToRecord.serialize();
      // data.id = data.id || uuid();
      json[key] = data;
    }
    else {
      return this._super(record, json, relationship);
    }
  }
});
