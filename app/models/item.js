import SearchIndex from 'appkit/utils/search-index';
import slugger from 'appkit/utils/slugger';

export default DS.Model.extend({
  itemData: DS.attr('json'),

  updateSearchIndex: function () {
    SearchIndex.indexItem(this);
  }.on('didUpdate', 'didCreate'),

  updateSlugIndex: function () {

    var slug = this.getSlug();

    if (slug !== this.get('initialSlug')) {

      window.ENV.firebase.child('slugs').child(slug).set(true);

      window.ENV.firebase.child('slugs').child(this.get('initialSlug')).remove();

      this.setInitialSlug();

    }

  }.on('didUpdate', 'didCreate'),

  setInitialSlug: function () {
    this.set('initialSlug', this.getSlug());
  }.on('didLoad'),

  removeSlugIndex: function () {
    window.ENV.firebase.child('slugs').child(this.getSlug()).remove();
  }.on('didDelete'),

  getSlug: function () {
    var data = this.get('itemData');
    return data.slug || this.getDefaultSlug();
  },

  getDefaultSlug: function () {

    var typeId = this.constructor.typeKey;

    var type = this.store.getById('content-type', typeId);

    var data = this.get('itemData');

    var sluggedDate = (Ember.isEmpty(data.publish_date) ? moment() : moment(data.publish_date)).format();

    return slugger({
      name: data.name,
      publish_date: sluggedDate
    }, type.get('id'), type.get('customUrls'));

  }
});
