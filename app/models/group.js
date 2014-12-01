export default Ember.Object.extend({
  key: null,
  name: null,
  permissions: Ember.Object.create(),
  users: Ember.A([]),
  isOpen: false,
  isEditingName: false
});
