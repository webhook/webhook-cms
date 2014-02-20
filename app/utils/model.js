import ItemAdapter from 'appkit/adapters/item';
import ItemModel from 'appkit/models/item';
import ItemSerializer from 'appkit/serializers/item';

import DataAdapter from 'appkit/adapters/data';
import DataModel from 'appkit/models/data';
import DataSerializer from 'appkit/serializers/data';

export default function getItemModelName(contentType) {

  var formattedTypeName = Ember.String.singularize(contentType.get('id')),
      modelName = formattedTypeName.charAt(0).toUpperCase() + formattedTypeName.slice(1);

  // Make a dynamic model/adapter so we can save data to `data/[modelName]`
  if (!window.App[modelName]) {

    if (contentType.get('oneOff')) {

      formattedTypeName = 'data';

      // // dynamic model
      // window.App[modelName] = DataModel.extend();

      // // dynamic adapter
      // window.App[modelName + 'Adapter'] = DataAdapter.extend();

      // // dynamic serializer
      // window.App[modelName + 'Serializer'] = DataSerializer.extend();

    } else {

      // dynamic model
      window.App[modelName] = ItemModel.extend();

      // dynamic adapter
      window.App[modelName + 'Adapter'] = ItemAdapter.extend({
        firebase: window.ENV.firebase.child('data'),
      });

      // dynamic serializer
      window.App[modelName + 'Serializer'] = ItemSerializer.extend();

    }

  }

  return formattedTypeName;

}
