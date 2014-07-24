// Simple component for selecting files
// usage: {{#select-file action='handleFile'}}Button Text{{/select-file}}
export default Ember.Component.extend({
  tagName: 'button',
  classNames: 'btn btn-neutral',

  accept: '*',
  multiple: false,

  didInsertElement: function () {

    var component = this;

    this.$().selectFile({
      accept  : this.get('accept'),
      multiple: this.get('multiple')
    }).on('selectedFile', function (event, file) {
      component.sendAction('action', file);
    });
  }

});
