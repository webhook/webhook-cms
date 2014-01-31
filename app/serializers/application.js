import uuid from 'appkit/utils/uuid';

export default DS.JSONSerializer.extend({
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
  },

  sideloadItem: function(type, item){

    var primaryKey = Ember.get(this, 'primaryKey'); // the key to this record's ID

    if (!item[primaryKey]) {
      // my brain hurts, this is a hack to normalize embedded objects
      item = this.store.serializerFor(type.typeKey).normalize(type, item);
      item[primaryKey] = uuid();
      this.store.push(type.typeKey, item);
    }

    return item;

  },

  extractRelationships: function(recordJSON, recordType) {

    recordType.eachRelationship(function(key, relationship) {
      var related = recordJSON[key], // The record at this relationship
          type = relationship.type;  // belongsTo or hasMany

      if (related && relationship.options.embedded === 'always'){

        // One-to-one
        if (relationship.kind === "belongsTo") {

          if (!related.id) {
            related = this.sideloadItem(type, related);

            // Replace object with ID of sideloaded item
            recordJSON[key] = related.id;
          }

          // Find relationships in this record
          this.extractRelationships(related, type);

        }

        // Many
        else if (relationship.kind === "hasMany") {

          // Loop through each object
          related.forEach(function (item, index) {

            if (!related.id) {
              this.sideloadItem(type, item);

              // Replace object with ID of sideloaded item
              related[index] = item.id;
            }

            // Find relationships in this record
            this.extractRelationships(item, type);

          }, this);

        }

      }
    }, this);

    return recordJSON;
  },


  /**
   Overrided method
  */
  normalize: function(type, payload) {
    var typeKey = type.typeKey,
        typeKeyPlural = typeKey.pluralize();

    // Many items (findMany, findAll)
    if (Ember.isArray(payload)) {
      payload.forEach(function (item) {
        this.extractRelationships(item, type);
      }, this);
    }

    // Single item (find)
    else {
      this.extractRelationships(payload, type);
    }

    return this._super(type, payload);
  }
});
