export default DS.FirebaseSerializer.extend({

  // fix legacy webhook relationships for emberfire
  // example: { "controls": { "control_id": true } }
  normalize: function (type, payload) {

    type.eachRelationship(function (key, relationship) {
      if (relationship.options.embedded && Ember.isArray(payload[key])) {
        var payloadKeyObject = {};
        payload[key].forEach(function (embed, index) {
          payloadKeyObject[window.ENV.firebase.push().key()] = embed;
        });
        payload[key] = payloadKeyObject;
      }
    });

    return this._super.apply(this, [type, payload]);
  },

  // firebase throws a fit with Ember's prototype extensions.
  // this returns the object to a native object
  serialize: function () {
    var jsonDirty = this._super.apply(this, arguments);
    var jsonClean = JSON.parse(JSON.stringify(jsonDirty));
    return jsonClean;
  }

});
