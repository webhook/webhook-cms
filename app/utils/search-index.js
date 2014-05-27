export default {
  indexItem: function (item, contentType) {

    var searchData = {};
    Ember.$.each(item.get('data'), function (key, value) {
      if (typeof value === 'object') {
        searchData[key] = JSON.stringify(value);
      } else {
        searchData[key] = value;
      }
    });

    window.ENV.indexItem(item.get('id'), searchData, contentType.get('oneOff'), contentType.get('id'));
  }
};
