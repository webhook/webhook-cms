import FormbuilderView from 'appkit/views/formbuilder';
import FormbuilderWidgetGridView from 'appkit/views/formbuilder-widget-grid';

export default FormbuilderView.extend({
  sortableItemsSelector: '> li',

  itemViewClass: FormbuilderWidgetGridView
});
