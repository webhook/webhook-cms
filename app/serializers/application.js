import uuid from 'appkit/utils/uuid';

export default DS.JSONSerializer.extend({ // or DS.RESTSerializer
  sideloadItem: function(type, item){

    var primaryKey = Ember.get(this, 'primaryKey'); // the key to this record's ID

    if (!item[primaryKey]) {
      item[primaryKey] = uuid();
    }

    this.store.push(type.typeKey, item);

    item = item[primaryKey];

    return item;

  },

  extractRelationships: function(recordJSON, recordType) {

    recordType.eachRelationship(function(key, relationship) {
      var related = recordJSON[key], // The record at this relationship
          type = relationship.type;  // belongsTo or hasMany

      if (related && relationship.options.embedded === 'always'){

        // One-to-one
        if (relationship.kind === "belongsTo") {
          // Sideload the object to the payload
          this.sideloadItem(type, related);

          // Replace object with ID
          recordJSON[key] = related[Ember.get(this, 'primaryKey')];

          // Find relationships in this record
          this.extractRelationships(related, type);
        }

        // Many
        else if (relationship.kind === "hasMany") {

          // Loop through each object
          related.forEach(function (item, index) {

            // Sideload the object to the payload
            this.sideloadItem(type, item);

            // Replace object with ID
            related[index] = item[Ember.get(this, 'primaryKey')];

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

    payload = this._super(type, payload);

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

    return payload;
  }
});
