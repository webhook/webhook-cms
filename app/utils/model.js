import ItemAdapter from 'appkit/adapters/item';
import ItemModel from 'appkit/models/item';
import ItemSerializer from 'appkit/serializers/item';

export default function getItemModelName(typeName) {

  var formattedTypeName = Ember.String.singularize(typeName.toLowerCase()),
      modelName = formattedTypeName.charAt(0).toUpperCase() + formattedTypeName.slice(1);

  // Make a dynamic model/adapter so we can save data to `data/[modelName]`
  if (!window.App[modelName]) {

    // dynamic model
    window.App[modelName] = ItemModel.extend();

    // dynamic adapter
    window.App[modelName + 'Adapter'] = ItemAdapter.extend();

    // dynamic serializer
    window.App[modelName + 'Serializer'] = ItemSerializer.extend();

  }

  return formattedTypeName;

}
