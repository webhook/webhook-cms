import ApplicationAdapter from 'appkit/adapters/application';

export default function getItemModelName(typeName) {

  var formattedTypeName = Ember.String.singularize(typeName.toLowerCase()),
      modelName = formattedTypeName.charAt(0).toUpperCase() + formattedTypeName.slice(1);

  // Make a dynamic model/adapter so we can save data to `data/[modelName]`
  if (!window.App[modelName]) {

    // dynamic model
    window.App[modelName] = DS.Model.extend({
      data: DS.attr('json')
    });

    // dynamic adapter
    window.App[modelName + 'Adapter'] = ApplicationAdapter.extend({
      dbBucket: window.ENV.dbBucket + '/data/'
    });

  }

  return formattedTypeName;

}
