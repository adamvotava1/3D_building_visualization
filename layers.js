import { GeoJsonLayer } from '@deck.gl/layers';

export function createGeoJsonLayer(data) {
  return new GeoJsonLayer({
    id: 'geojson-layer',
    data: data,
    stroked: true,
    filled: true,
    extruded: true,
    lineWidthMinPixels: 2,
    getFillColor: e => {
      let fillColor = [150, 150, 150, 255];
      if (e.properties && e.properties.amenity) {
        switch (e.properties.amenity) {
          case 'place_of_worship':
            fillColor = [0, 0, 255, 255];
            break;
          case 'parking':
            fillColor = [0, 255, 0, 255]; // Green color
            break;
          case 'hospital':
            fillColor = [255, 0, 0, 255]; // Red color
            break;
          default:
            break;
        }
      }
      return fillColor;
    },
    getElevation: e => {
      if (e.properties && e.properties.hasOwnProperty('building:levels')) {
        return e.properties['building:levels'] * 3;
      } else if (e.properties && e.properties.hasOwnProperty('height')) {
        return e.properties.height * 1;
      } else {
        return 3;
      }
    }
  });
}