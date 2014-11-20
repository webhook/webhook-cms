export default Ember.CollectionView.extend({
  itemViewClass: Ember.View.extend({

    templateName: 'wh/settings/group-permissions',

    permission: null,

    willInsertElement: function () {
      var view = this;
      this.get('parentView.group').addObserver('permissions.' + this.get('content.id'), function () {
        view.set('permission', view.get('content').getGroupPermission(view.get('parentView.group')));
      });
      view.set('permission', view.get('content').getGroupPermission(view.get('parentView.group')));
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
