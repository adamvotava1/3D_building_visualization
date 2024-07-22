import { ScatterplotLayer, GeoJsonLayer } from '@deck.gl/layers';

export function createScatterplotLayer() {
  return new ScatterplotLayer({
    id: 'scatterplot-layer',
    getPosition: cafe => [cafe.lon, cafe.lat],
    getRadius: 10,
    getFillColor: [255, 140, 0],
    radiusUnits: 'pixels',
  });
}

export function createGeoJsonLayer(data) {
  return new GeoJsonLayer({
    id: 'geojson-layer',
    data: './Height_of_buildings.geojson',
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