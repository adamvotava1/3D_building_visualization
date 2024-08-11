import * as turf from '@turf/turf';

/**
 * @returns {Object} Objekt obsahující bounding box jako pole a řetězec.
 */
export function getBoundingBoxFromMap(map) {
  const bounds = map.getBounds();
  
  // Získání jednotlivých souřadnic
  const south = bounds.getSouth();
  const west = bounds.getWest();
  const north = bounds.getNorth();
  const east = bounds.getEast();
  
  // Vytvoření pole souřadnic
  const coordsArray = [south, west, north, east];
  
  return {
    array: coordsArray,
    string: coordsArray.join(', ')
  };
}

/**
 * Vypočítá plochu bounding boxu v km².
 * @param {Object} bbox - Bounding box ve formátu {array: [south, west, north, east]}.
 * @returns {number} Plocha v km².
 */
export function calculateArea(bbox) {
  const polygon = turf.bboxPolygon(bbox.array);
  const area = turf.area(polygon);
  return area / 1000000; // Převod z m² na km²
}
