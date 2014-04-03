export default Ember.Component.extend({
  classNames: ['wy-modal'],

  show: false,
  canClose: true,

  showChange: function () {
    this.$().toggle();
    this.$mask.css('z-index', parseInt(this.$().css('z-index'), 10) - 1);
    this.$mask.toggleClass('on');
  }.observes('show'),

  willInsertElement: function () {
    this.$mask = Ember.$('<div class="wy-body-mask">').css('left', 0);
  },

  didInsertElement: function () {
    this.$mask.insertBefore(this.$());
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
