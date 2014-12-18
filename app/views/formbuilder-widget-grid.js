import FormbuilderWidgetView from 'appkit/views/formbuilder-widget';

export default FormbuilderWidgetView.extend({
  templateVar: function () {
    return '{{ item.%@[0].%@ }}'.fmt(this.get('parentView.model.name'), this.get('content.name'));
  }.property('parentView.model.name', 'content.name')
});
