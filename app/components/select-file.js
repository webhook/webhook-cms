export default Ember.Component.extend({
  tagName: 'button',
  classNames: 'btn',

  accept: '*',
  multiple: false,

  didInsertElement: function () {

    var component = this;

    this.$().selectFile({
      accept  : this.get('accept'),
      multiple: this.get('multiple')
    }).on('selectedFile', function (event, file) {
      // window.console.log(file);

      // window.console.log(component.get('action'));

      component.sendAction('action', file);


      // window.ENV.sendGruntCommand('preset_local:' + dataString);

      // self.selectedFile.call(self, file);
    });
  }

});
