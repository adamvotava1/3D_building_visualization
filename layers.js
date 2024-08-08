import { PolygonLayer } from '@deck.gl/layers';

function getRandomColor() {
  return [
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    255 // Alpha channel
  ];
}

export function createPolygonLayer(data, id) {
  return new PolygonLayer({
    id: id,
    data: data.features,
    pickable: false,
    stroked: true,
    filled: true,
    wireframe: true,
    lineWidthMinPixels: 1,
    extruded: true,
    getPolygon: d => d.geometry.coordinates[0],
    getElevation: 0,
    getFillColor: () => [0, 255, 0],
    //getFillColor: () => getRandomColor(), // Use random color for each feature
    getLineColor: [0, 0, 0],
    parameters: {
      cullFace: false
    }
  });
}