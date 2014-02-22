export default function validateControl (control) {

  control.set('isValid', true);
  control.set('widgetErrors', Ember.A([]));

  if (control.get('required') && !control.get('value')) {
    control.set('isValid', false);
    control.get('widgetErrors').pushObject('This field is required.');
  }

  // switch (control.get('controlType.widget')) {
  // case 'name':
  //   control.set('isValid', control.get('value.first') && control.get('value.last'));
  //   break;
  // }

}
