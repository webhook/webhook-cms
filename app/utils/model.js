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
      firebase: new Firebase("https://" + window.ENV.dbName + ".firebaseio.com/" + window.ENV.dbBucket + "/data/"),
    });

    // dynamic serializer
    window.App[modelName + 'Serializer'] = DS.JSONSerializer.extend({
      normalize: function (type, hash) {
        var newHash;

        if (Ember.isArray(hash)) {
          newHash = Ember.$.map(hash, this._normalizeSingle);
        } else {
          newHash = this._normalizeSingle(hash);
        }

        return this._super(type, newHash);
      },
      serialize: function (record, options) {
        return record.get('data');
      },
      _normalizeSingle: function (hash) {
        var newHash = { data: {} };

        Ember.$.each(hash, function(key, value) {
          if (key === 'id') {
            newHash[key] = value;
          } else {
            newHash.data[key] = value;
          }
        });

        return newHash;
      }
    });

  }

  return formattedTypeName;

}
