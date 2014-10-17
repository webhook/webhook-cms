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

  updateMap: function () {

    var map = this.get('mapInstance'),
        marker = this.get('markerInstance'),
        location = this.get('control.value');

    if (Ember.isEmpty(location)) {
      if (marker !== null) {
        map.removeLayer(marker);
        this.set('markerInstance', null);
      }
      map.setView(this.get('defaultCoords'), 2);
      return;
    }

    var coords = [location.latitude, location.longitude];

    map.setView(coords, this.get('defaultZoom'));

    if (null == marker) {
      marker = L.marker(coords).addTo(map);
      this.set('markerInstance', marker);
    } else {
      marker.setLatLng(coords);
    }

  }.observes('control.value'),

  didInsertElement: function () {
    var map = L.map(this.$('.wh-geolocation-maps').get(0));
    this.set('mapInstance', map);

    var tiles = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
    var attribution = [
      '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
    ];

    L.tileLayer(tiles, {
      attribution: attribution.join(', ')
    }).addTo(map);

    if (Ember.isEmpty(this.get('control.value'))) {
      map.setView(this.get('defaultCoords'), 2);
    } else {
      this.updateMap();
    }
  },

  actions: {
    parseInput: function (value) {

      var component = this;

      if (Ember.isEmpty(value)) {
        component.set('control.value', null);
        return;
      }

      // Use Google Geocoding service for address lookups.
      Ember.$.getJSON('https://maps.googleapis.com/maps/api/geocode/json', {
        address: value
      }).done(function(response) {
        if (response.status === 'OK') {
          var location = response.results[0].geometry.location;
          component.set('control.value', { latitude: location.lat, longitude: location.lng });
        }
      });

    }
  }
});
