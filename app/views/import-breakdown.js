export default Ember.View.extend({
  templateName: 'import-breakdown',

  dataBreakdown: function () {

    var dataBackup = this.get('data');

    if (!dataBackup) {
      return {};
    }

    var dataController = this.get('controller');

    var types = dataBackup.getWithDefault('contentTypes', []).getEach('id');

    types.addObjects(dataBackup.getWithDefault('data', []).getEach('id'));

    var breakdown = {
      content: Ember.$.map(types, function (typeId) {

        var itemCount = 0;

        var type = dataBackup.get('data').findBy('id', typeId);

        if (type) {
          if (type.get('oneOff')) {
            itemCount = 1;
          } else {
            itemCount = type.get('items.length');
          }
        }

        return {
          name: typeId,
          itemCount: itemCount
        };
      }),
      settings: Ember.$.map(dataBackup.get('settings.general'), function (value, name) {
        return {
          name: name,
          value: value
        };
      }),
      redirect: Ember.$.map(dataBackup.get('settings.redirect'), function (value, name) {
        return {
          id: name
        };
      })
    };

    return breakdown;

  }.property('data')
});
