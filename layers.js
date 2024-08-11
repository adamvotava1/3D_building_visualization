import { PolygonLayer } from '@deck.gl/layers';

/**
 * Generuje náhodnou barvu
 * @returns {number[]} Pole reprezentující RGBA barvu
 */
function getRandomColor() {
  return [
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    255 // Alpha kanál
  ];
}

/**
 * Vytváří polygonovou vrstvu pro mapovou vizualizaci
 * @param {Object} data - GeoJSON data pro vytvoření vrstvy
 * @param {string} id - Identifikátor vrstvy
 * @returns {PolygonLayer} Nová instance PolygonLayer
 */
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
    getFillColor: () => getRandomColor(), // Použití náhodné barvy pro každý prvek
    getLineColor: [0, 0, 0],
    parameters: {
      cull: true
    }
  });
}