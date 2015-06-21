export default Ember.Controller.extend({
  error: null,
  saving: false,

  actions: {
    save: function (itemJSON) {
      this.set('error', null);
      this.set('saving', true);

      var itemData;

      try {
        itemData = JSON.parse(itemJSON);
      } catch (error) {
        return this.set('error', error);
      }

      this.get('model').set('itemData', itemData);
      this.get('model').save().then(function (item) {
        this.set('saving', false);
        this.send('notify', 'info', item.get('itemData.name') + ' saved!', { icon: 'ok-sign' });
        this.transitionToRoute('wh.content.type', item.get('constructor.typeKey'));
      }.bind(this));

    }
  }
});
