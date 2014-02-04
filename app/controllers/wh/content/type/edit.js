export default Ember.ObjectController.extend({
  type: null,

  actions: {
    saveItem: function () {

      var data = {};

      this.get('type.controls').filterBy('value').forEach(function (control) {
        data[control.get('name')] = control.get('value');
      });

      this.get('model').setProperties({
        data: data
      }).save().then(function () {
        this.get('type.controls').setEach('value', null);

        window.ENV.sendGruntCommand('build');
        window.ENV.sendBuildSignal();
        
        this.transitionToRoute('wh.content.type', this.get('type'));
      }.bind(this));

    }
  }
});
