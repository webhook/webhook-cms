export default Ember.Route.extend({
  setupController: function (controller) {

    controller.set('wxmlDoneClass', 'pending');
    controller.set('wxmlStatus', {
      messages: false,
      parsingXML: { running: false, class: 'pending' },
      siteInfo: { running: false, class: 'pending' },
      tags: { running: false, class: 'pending' },
      authors: { running: false, class: 'pending' },
      images: { running: false, class: 'pending' },
      posts: { running: false, class: 'pending' },
      pages: { running: false, class: 'pending' },
      firebase: { running: false, class: 'pending' },
      search: { running: false, class: 'pending' },
    });

    controller.set('isComplete', false);

    controller.convertXml();

    return this._super.apply(this, arguments);
  }
});
