export default Ember.Controller.extend({
  error: null,
  saving: false,

  actions: {
    save: function (itemJSON) {
      this.set('error', null);
      this.set('saving', true);

      try {
        var itemData = JSON.parse(itemJSON);
        this.get('model').set('itemData', itemData);
        this.get('model').save().then(function (item) {
          this.set('saving', false);
          console.log(item);
          this.send('notify', 'info', item.get('itemData.name') + ' saved!', { icon: 'ok-sign' });
        }.bind(this));
      } catch (error) {
        this.set('error', error);
      }

    }
  }
});
