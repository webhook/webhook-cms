export default Ember.View.extend({
  didInsertElement: function () {
    if(window.Raygun) {
      window.Raygun.send(this.controller.model);
    }
  },
});
