import ApplicationAdapter from 'appkit/adapters/application';
import ItemModel from 'appkit/models/item';
import ItemSerializer from 'appkit/serializers/item';

export default function getItemModelName(contentType) {

  var formattedTypeName = Ember.String.singularize(contentType.get('id')),
      modelName = formattedTypeName.charAt(0).toUpperCase() + formattedTypeName.slice(1);

  // Make a dynamic model/adapter so we can save data to `data/[modelName]`
  if (!window.App[modelName]) {

    if (contentType.get('oneOff')) {

      formattedTypeName = 'data';

    } else {

      // dynamic model
      window.App[modelName] = ItemModel.extend();

      // dynamic adapter
      window.App[modelName + 'Adapter'] = ApplicationAdapter.extend({
        // needs to be set here because it doesn't exist when adapter/item.js is parsed from the ItemAdapter import
        firebase: window.ENV.firebase.child('data')
      });

      // dynamic serializer
      window.App[modelName + 'Serializer'] = ItemSerializer.extend();

    }

  }

  return formattedTypeName;

}
