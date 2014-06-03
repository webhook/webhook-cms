export default DS.JSONSerializer.extend({
  keyForAttribute: function(attr) {
    return Ember.String.underscore(attr);
  },
  normalize: function (type, payload) {

    var normalizedPayload = {};

    Ember.$.each(payload, function(key, value) {
      normalizedPayload[Ember.String.camelize(key)] = value;
    });

    return this._super(type, normalizedPayload);
  }
});
