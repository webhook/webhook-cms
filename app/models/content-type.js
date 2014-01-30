export default DS.Model.extend(Ember.Validations.Mixin, {
  name: DS.attr('string'),
  fields: DS.hasMany('field', { embedded: 'always' }),

  // force a valid name
  forceValid: function () {
    var name = this.get('name'),
        regex = /(\W|[A-Z])/g;
    if (name && regex.test(name)) {
      this.set('name', name.replace(regex, ''));
    }
  }.observes('name'),

  validations: {
    name: {
      presence: true,
      format: { with: /^([a-z]|\d)+$/, message: 'must be lowercase letters and numbers only' }
    }
  }
});
