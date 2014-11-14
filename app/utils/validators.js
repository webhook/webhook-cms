import downcode from 'appkit/utils/downcode';

export default function validateControls (contentType) {

  Ember.Logger.log('Validating controls.');

  var controls = contentType.get('controls');

  controls.setEach('widgetIsValid', true);

  var regex = {
    email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    url: /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/
  };

  var invalidate = function (control, message) {
    control.set('widgetIsValid', false);
    control.get('widgetErrors').pushObject(message);
  };

  var nameControl;

  controls.forEach(function (control) {

    var value = control.get('value'),
        options = control.get('meta') || {};

    control.set('widgetErrors', Ember.A([]));

    if (Ember.isEmpty(value)) {
      // Browsers will invalidate [type=number] inputs with non numeric values and return "" as the value.
      if (control.get('controlType.widget') === 'number' && Ember.$('[name=' + control.get('name') + ']').is(':invalid')) {
        invalidate(control, 'This field must be a number.');
      }
      if (control.get('required')) {
        invalidate(control, 'This field is required');
      }
      Ember.Logger.warn('-- %@: %@'.fmt(control.get('name'), control.get('widgetErrors').join(', ')));
      return;
    }

    switch (control.get('controlType.widget')) {
    case 'textfield':
    case 'textarea':
      if (options.min && value.length < options.min) {
        invalidate(control, 'This field has a minimum length of ' + options.min + '.');
      }
      if (options.max && value.length > options.max) {
        invalidate(control, 'This field has a maximum length of ' + options.max + '.');
      }
      break;
    case 'number':
      if (!Ember.$.isNumeric(value)) {
        invalidate(control, 'This field must be a number.');
      }
      if (options.min && parseInt(value, 10) < options.min) {
        invalidate(control, 'This field has a minimum value of ' + options.min + '.');
      }
      if (options.max && parseInt(value, 10) > options.max) {
        invalidate(control, 'This field has a maximum value of ' + options.max + '.');
      }
      break;
    case 'email':
      if (!regex.email.test(value)) {
        invalidate(control, 'This field must be an email address.');
      }
      break;
    case 'url':
      if (!regex.url.test(value)) {
        invalidate(control, 'This field must be a URL.');
      }
      break;
    case 'datetime':
      if (!moment(value).isValid()) {
        invalidate(control, 'This field must be a valid date and time.');
      }
      break;
    }

    if (control.get('name') === 'slug' && !Ember.isEmpty(value)) {
      var correctedSlug = value;
      control.set('correctedSlug', null);
      if (value.charAt(0) === '/') {
        invalidate(control, 'The slug cannot start with a "/".');
        correctedSlug = correctedSlug.substr(1);
      }
      if (value.substr(-1) === '/') {
        invalidate(control, 'The slug cannot end with a "/".');
        correctedSlug = correctedSlug.slice(0, -1);
      }
      if (/\s+/g.test(value)) {
        invalidate(control, 'The slug cannot contain spaces.');
        correctedSlug = correctedSlug.replace(/\s+/g, '-');
      }
      if (value !== downcode(value)) {
        invalidate(control, 'The slug contains invalid characters.');
        correctedSlug = downcode(correctedSlug);
      }
      if (correctedSlug !== value) {
        control.set('correctedSlug', correctedSlug);
      }
    }

    if (control.get('widgetIsValid')) {
      Ember.Logger.log('-- %@: ✓'.fmt(control.get('name')));
    } else {
      Ember.Logger.warn('-- %@: %@'.fmt(control.get('name'), control.get('widgetErrors').join(', ')));
    }

  });

  if (controls.isAny('widgetIsValid', false)) {
    return Ember.RSVP.Promise.reject(controls.filterBy('widgetIsValid', false).map(function (control) {
      return control.get('name') + ': ' + control.get('widgetErrors').join(', ');
    }).join('/n'));
  } else {
    return Ember.RSVP.Promise.resolve(controls);
  }

}
