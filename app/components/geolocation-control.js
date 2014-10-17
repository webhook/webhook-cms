export default Ember.Component.extend({

  defaultCoords: [51.5, -0.09],
  defaultZoom: 8,

  mapInstance: null,
  markerInstance: null,

  coordsString: function () {
    var value =this.get('control.value');

    if (value.hasOwnProperty('latitude') && value.hasOwnProperty('longitude')) {
      return value.latitude + ', ' + value.longitude;
    }
  }.property('control.value'),

  didInsertElement: function () {
    var map = L.map(this.$('.wh-geolocation-maps').get(0));
    this.set('mapInstance', map);

    L.tileLayer('http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
    }).addTo(map);

    var value = this.get('control.value'),
        coords = this.get('defaultCoords'),
        defaultZoom = this.get('defaultZoom');

    if (value.hasOwnProperty('latitude') && value.hasOwnProperty('longitude')) {
      coords[0] = value.latitude;
      coords[1] = value.longitude;

      var marker = L.marker(coords).addTo(map);
      this.set('markerInstance', marker);
    }

    map.setView(coords, defaultZoom);
  },

  actions: {
    parseCoords: function (value) {
      var map = this.get('mapInstance'),
          marker = this.get('markerInstance');

      if ('' === value) {
        this.set('control.value', {});

        if (null != marker) {
          map.removeLayer(marker);
          this.set('markerInstance', null);
        }

        return;
      }

      var urlRegex = /@(.*)\//g;
      if (urlRegex.test(value)) {
        value = value.match(urlRegex)[0];
        // Slice the last , character (this is the zoom property).
        value = value.slice(1, value.lastIndexOf(','));
      }

      var coords = value.split(',');
      if (2 != coords.length) {
        return;
      }

      value = { latitude: parseFloat(coords[0]), longitude: parseFloat(coords[1]) };
      if (isNaN(value.latitude) || isNaN(value.longitude)) {
        return;
      }

      map.setView([value.latitude, value.longitude]);

      if (null == marker) {
        marker = L.marker(coords).addTo(map);
        this.set('markerInstance', marker);
      } else {
        marker.setLatLng(coords);
      }

      this.set('control.value', value);
    }
  }
});
