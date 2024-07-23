import { GeoJsonLayer } from '@deck.gl/layers';


export function createGeoJsonLayer(data) {
  return new GeoJsonLayer({
    id: 'geojson-layer',
    data: data,
    stroked: true,
    filled: true,
    extruded: true,
    lineWidthMinPixels: 2,
    getFillColor: [150, 150, 150, 255],
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