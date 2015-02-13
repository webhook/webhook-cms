import slugger from 'appkit/utils/slugger';
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

  var validationPromises = Ember.A([]);

  controls.forEach(function (control) {

    var value = control.get('value'),
        options = control.get('meta') || {},
        widget = control.get('controlType.widget');

    control.set('widgetErrors', Ember.A([]));

    // make sure the default slug is not taken
    if (control.get('name') === 'slug' && Ember.isEmpty(value)) {

      var publishDate = controls.findBy('name', 'publish_date').get('value');
      var sluggedDate = (Ember.isEmpty(publishDate) ? moment() : moment(publishDate)).format();

      value = slugger({
        name: controls.findBy('name', 'name').get('value'),
        publish_date: sluggedDate
      }, contentType.get('id'), contentType.get('customUrls'));

    }

    // Quickly handle empty controls
    if (Ember.isEmpty(value) || (typeof value === 'object' && Ember.keys(value).length === 0)) {
      // Browsers will invalidate [type=number] inputs with non numeric values and return "" as the value.
      if (control.get('controlType.widget') === 'number' && Ember.$('[name=' + control.get('name') + ']').is(':invalid')) {
        invalidate(control, 'This field must be a number.');
      }
      if (control.get('required')) {
        invalidate(control, 'This field is required');
      }
      if (control.get('widgetIsValid')) {
        Ember.Logger.log('-- %@: ✓'.fmt(control.get('name')));
      } else {
        Ember.Logger.warn('-- %@: %@'.fmt(control.get('name'), control.get('widgetErrors').join(', ')));
      }
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

    if (control.get('name') === 'slug') {

      var correctedValue = value;

      // Slugs should neither start nor end with a slash.
      correctedValue = correctedValue.replace(/^\/+/, '');
      correctedValue = correctedValue.replace(/\/+$/, '');

      // Replace illegal firebase key characters.
      correctedValue = correctedValue.replace(/\s+|\.+|\#+|\$+|\[+|\]+/g, '-');

      // No more than one hyphen in a row.
      correctedValue = correctedValue.replace(/\-+/g, '-');

      // Encode special characters.
      correctedValue = downcode(correctedValue);

      // If we have made changes, reflect in UI.
      if (correctedValue !== value) {
        control.set('value', correctedValue);
      }

      // If we have made changes, check for dupes in Firebase.
      if (correctedValue !== control.get('initialValue')) {

        var dupeSlugCheck = new Ember.RSVP.Promise(function (resolve, reject) {
          window.ENV.firebase.child('slugs').child(correctedValue).once('value', function (snapshot) {
            if (snapshot.val()) {
              invalidate(control, 'This URL is already in use. Please choose another.');
            }
            resolve();
          });
        });

        validationPromises.pushObject(dupeSlugCheck);

      }
    }

    if (control.get('widgetIsValid')) {
      Ember.Logger.log('-- %@: ✓'.fmt(control.get('name')));
    } else {
      Ember.Logger.warn('-- %@: %@'.fmt(control.get('name'), control.get('widgetErrors').join(', ')));
    }

  });

  return Ember.RSVP.Promise.all(validationPromises).then(function () {

    if (controls.isAny('widgetIsValid', false)) {
      return Ember.RSVP.Promise.reject(controls.filterBy('widgetIsValid', false).map(function (control) {
        return control.get('name') + ': ' + control.get('widgetErrors').join(', ');
      }).join('/n'));
    } else {
      return Ember.RSVP.Promise.resolve(controls);
    }

  });

}
