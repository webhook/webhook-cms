export default Ember.CollectionView.extend({
  itemViewClass: Ember.View.extend({

    templateName: 'wh/settings/group-permissions',

    permission: null,

    setPermission: function () {
      this.set('permission', this.get('parentView.group.permissions').get(this.get('content.id')));
    },

    willInsertElement: function () {
      this.get('parentView.group').addObserver('permissions.' + this.get('content.id'), this.setPermission.bind(this));
      this.setPermission();
    },

    willDestroyElement: function () {
      this.get('parentView.group').removeObserver('permissions.' + this.get('content.id'), this.setPermission.bind(this));
    },

    canView: function () {
      return ['view', 'draft', 'publish', 'delete'].contains(this.get('permission'));
    }.property('permission'),

    canDraft: function () {
      return ['draft', 'publish', 'delete'].contains(this.get('permission'));
    }.property('permission'),

    canPublish: function () {
      return ['publish', 'delete'].contains(this.get('permission'));
    }.property('permission'),

    canDelete: function () {
      return this.get('permission') === 'delete';
    }.property('permission')

  })
});
