/* global L */
export default Ember.Component.extend({

  defaultCoords: [51.5, -0.09],
  defaultZoom: 8,

  mapInstance: null,
  markerInstance: null,

  setCoordsString: function () {
    var value = this.get('control.value');

    if (!Ember.isEmpty(value) && value.hasOwnProperty('latitude') && value.hasOwnProperty('longitude')) {
      this.set('coordsString', value.latitude + ', ' + value.longitude);
    }
  }.observes('control.value').on('init'),

  didInsertElement: function () {
    var map = L.map(this.$('.wh-geolocation-maps').get(0));
    this.set('mapInstance', map);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
    }).addTo(map);

    var value = this.get('control.value'),
        coords = this.get('defaultCoords'),
        defaultZoom = this.get('defaultZoom'),
        marker = null;

    if (!Ember.isEmpty(value) && value.hasOwnProperty('latitude') && value.hasOwnProperty('longitude')) {
      coords[0] = value.latitude;
      coords[1] = value.longitude;

      marker = L.marker(coords).addTo(map);
      this.set('markerInstance', marker);
    }

    map.setView(coords, marker ? defaultZoom : 2);
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
      if (2 !== coords.length) {
        return;
      }

      value = { latitude: parseFloat(coords[0]), longitude: parseFloat(coords[1]) };
      if (isNaN(value.latitude) || isNaN(value.longitude)) {
        return;
      }

      map.setView([value.latitude, value.longitude], this.get('defaultZoom'));

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
