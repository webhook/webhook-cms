export default DS.FirebaseSerializer.extend({

  normalize: function (type, payload) {

    // fix relationships for emberfire
    // example: { "controls": { "control_id": true } }
    type.eachRelationship(function (key, relationship) {
      if (relationship.options.embedded && Ember.isArray(payload[key])) {
        var payloadKeyObject = {};
        payload[key].forEach(function (embed, index) {
          payloadKeyObject[window.ENV.firebase.push().name()] = embed;
        });
        payload[key] = payloadKeyObject;
      }
    });

    return this._super.apply(this, [type, payload]);
  },

  serialize: function () {

    var jsonDirty = this._super.apply(this, arguments);
    var jsonClean = JSON.parse(JSON.stringify(jsonDirty));

    return jsonClean;

  }

});
