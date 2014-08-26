export default DS.JSONSerializer.extend({
  normalize: function (type, hash) {
    var newHash;

    // Was using Ember.isArray, but user had `length` as a field name.
    if (Ember.$.isArray(hash)) {
      newHash = Ember.$.map(hash, this._normalizeSingle);
    } else {
      newHash = this._normalizeSingle(hash);
    }

    return this._super(type, newHash);
  },
  serialize: function (record, options) {
    return JSON.parse(JSON.stringify(record.get('itemData')));
  },
  _normalizeSingle: function (hash) {
    var newHash = { itemData: {} };

    Ember.$.each(hash, function(key, value) {
      if (key === 'id') {
        newHash[key] = value;
      } else {
        newHash.itemData[key] = value;
      }
    });

    return newHash;
  }
});
