export default Ember.Component.extend({
  classNames: ['wy-modal'],

  show: false,
  canClose: true,

  showChange: function () {
    this.$().toggle();
    this.$mask.toggleClass('on');
  }.observes('show'),

  willInsertElement: function () {
    this.$mask = Ember.$('<div class="wy-body-mask">').appendTo('body');
  },

  didInsertElement: function () {
    this.$().hide().css({
      top: '20%',
      marginTop: 0
    });
  },

  willDestroyElement: function () {
    this.$mask.remove();
  },

  actions: {
    confirm: function (data) {
      this.sendAction('confirm', data);
    },
    cancel: function () {
      this.sendAction('cancel');
    },
    close: function () {
      this.set('show', false);
    }
  }
});
