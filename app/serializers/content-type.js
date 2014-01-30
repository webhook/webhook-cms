import ApplicationSerializer from 'appkit/serializers/application';

export default ApplicationSerializer.extend({ // or DS.RESTSerializer
  serializeHasMany: function(record, json, relationship) {
    var key = relationship.key,
        hasManyRecords = Ember.get(record, key);

    // Embed hasMany relationship if records exist
    if (hasManyRecords && relationship.options.embedded === 'always') {
      json[key] = [];
      hasManyRecords.forEach(function(item, index){
        var data = item.serialize();
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

    if (belongsToRecord && relationship.options.embedded === 'always') {
      var data = belongsToRecord.serialize();
      json[key] = data;
    }
    else {
      return this._super(record, json, relationship);
    }
  }
});
