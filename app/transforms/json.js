export default DS.Transform.extend({
  serialize: function (value) {

    if (Ember.isBlank(value)) {
      return null;
    }

    // Clean up the JSON object of extraneous Ember properties.
    var cleaned = {};
    for (var key in $.extend(true, {}, value)) {
      // Skip these
      if (key === 'isInstance' ||
      key === 'isDestroyed' ||
      key === 'isDestroying' ||
      key === 'concatenatedProperties' ||
      typeof value[key] === 'function') {
        continue;
      }
      cleaned[key] = value[key];
    }
    return cleaned;
  },
  deserialize: function (value) {
    return Ember.Object.create(Ember.isBlank(value) ? {} : value);
  }
});
