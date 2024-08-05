import { PolygonLayer } from '@deck.gl/layers';

export function createPolygonLayer(data, id, color) {
  return new PolygonLayer({
    id: id,
    data: data.features,
    pickable: true,
    stroked: true,
    filled: true,
    wireframe: true,
    lineWidthMinPixels: 1,
    extruded: true,
    getPolygon: d => d.geometry.coordinates[0],
    getElevation: 0,
    getFillColor: color,
    getLineColor: [0, 0, 0],
    material: {
      ambient: 0.6,
      diffuse: 0.9,
      shininess: 50,
      specularColor: [60, 64, 70]
    }
  });
}