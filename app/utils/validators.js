export default function validateControls (controls) {

  controls.setEach('widgetIsValid', true);

  var regex = {
    email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    url: /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/
  };

  var invalidate = function (control, message) {
    control.set('widgetIsValid', false);
    control.get('widgetErrors').pushObject(message);
  };

  controls.forEach(function (control) {

    var value = control.get('value');

    control.set('widgetErrors', Ember.A([]));

    if (control.get('required') && !value) {
      invalidate(control, 'This field is required');
    }

    if (!value) {
      return;
    }

    switch (control.get('controlType.widget')) {
    case 'number':
      if (Ember.typeOf(value) !== 'number') {
        invalidate(control, 'This field must be a number.');
      }
      break;
    case 'email':
      if (!regex.email.test(value)) {
        invalidate(control, 'This field must be an email address.');
      }
      break;
    case 'url':
      if (!regex.email.test(value)) {
        invalidate(control, 'This field must be a URL.');
      }
      break;
    case 'datetime':
      if (!moment(value).isValid()) {
        invalidate(control, 'This field must be a valid date and time.');
      }
      break;
    }

  });

}
