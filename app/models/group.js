export default Ember.Object.extend({
  key: null,
  name: null,
  permissions: Ember.Object.create(),
  users: Ember.A([]),
  isOpen: false,
  isEditingName: false,
  isSaved: false,
  saveChanged: function () {
    if (!this.get('isSaving')) {
      var group = this;
      group.set('isSaved', true);
      Ember.run.later(function () {
        group.set('isSaved', false);
      }, 500);
    }
  }.observes('isSaving'),
  isSaving: function () {
    return !!this.get('saveQueue');
  }.property('saveQueue'),
  saveQueue: 0
});
