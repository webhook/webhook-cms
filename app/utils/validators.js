export default function validateControls (controls) {

  controls.setEach('widgetIsValid', true);

  controls.forEach(function (control) {
    control.set('widgetErrors', Ember.A([]));

    if (control.get('required') && !control.get('value')) {
      control.set('widgetIsValid', false);
      control.get('widgetErrors').pushObject('This field is required.');
    }

  });

  // switch (control.get('controlType.widget')) {
  // case 'name':
  //   control.set('isValid', control.get('value.first') && control.get('value.last'));
  //   break;
  // }

}
