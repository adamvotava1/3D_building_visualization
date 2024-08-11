import { GeoJsonLayer } from '@deck.gl/layers';

// Definice barev pro různé typy amenities
const AMENITY_COLORS = {
  place_of_worship: [0, 0, 255, 255],  // Modrá
  parking: [0, 255, 0, 255],           // Zelená
  hospital: [255, 0, 0, 255],          // Červená
  default: [150, 150, 150, 255]        // Šedá (výchozí)
};

// Konstanty pro výpočet výšky budov
const DEFAULT_HEIGHT = 3;
const LEVEL_HEIGHT = 3;

/**
 * Vytvoří vrstvu GeoJsonLayer pro zobrazení budov na mapě.
 * @param {Object} data - GeoJSON data obsahující informace o budovách.
 * @returns {GeoJsonLayer} Nová instance GeoJsonLayer.
 */
export function createGeoJsonLayer(data) {
  return new GeoJsonLayer({
    id: 'geojson-layer',
    data: data,
    stroked: true,
    filled: true,
    extruded: true,
    lineWidthMinPixels: 2,
    getFillColor: getFillColorForFeature,
    getElevation: getElevationForFeature
  });
}

/**
 * Určí barvu výplně pro daný prvek na základě jeho vlastností.
 * @param {Object} feature - GeoJSON prvek reprezentující budovu.
 * @returns {Array} RGBA barva jako pole čtyř čísel.
 */
function getFillColorForFeature(feature) {
  if (feature.properties && feature.properties.amenity) {
    return AMENITY_COLORS[feature.properties.amenity] || AMENITY_COLORS.default;
  }
  return AMENITY_COLORS.default;
}

/**
 * Určí výšku budovy na základě jejích vlastností.
 * @param {Object} feature - GeoJSON prvek reprezentující budovu.
 * @returns {number} Výška budovy v metrech.
 */
function getElevationForFeature(feature) {
  if (!feature.properties) return DEFAULT_HEIGHT;

  if (feature.properties['building:levels']) {
    return feature.properties['building:levels'] * LEVEL_HEIGHT;
  } 
  
  if (feature.properties.height) {
    return feature.properties.height;
  }

  return DEFAULT_HEIGHT;
}