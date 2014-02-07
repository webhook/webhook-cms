export default Ember.Component.extend({
  didInsertElement: function () {
    this.$('[data-upload]:input').each(function () {
      var $element = $(this),
          data     = $element.data();
      $element.upload(data);
    });
  }
});
