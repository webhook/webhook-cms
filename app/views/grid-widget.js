import WidgetView from 'appkit/views/widget';

export default WidgetView.extend({
  willInsertElement: function () {
    this.set('control.value', this.get('values')[this.get('control.name')]);
  }
});
