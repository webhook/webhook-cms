export default Ember.View.extend({
  templateName: 'components/formbuilder-widget',
  classNames: ['wy-control-group'],

  classNameBindings: [
    'control.required:wy-control-group-required',
    'control.widgetIsValid::wy-control-group-error'
  ]
});
