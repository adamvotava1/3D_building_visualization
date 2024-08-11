import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox';
import mapboxgl from 'mapbox-gl';
import { initializeMap } from './mapSetup.js';
import { createPolygonLayer } from './layers.js';
import { load } from '@loaders.gl/core';
import { ShapefileLoader } from '@loaders.gl/shapefile';
import proj4 from 'proj4';
import { getBoundingBoxFromMap, createStatsCounter } from './utils.js';

// Inicializace mapy
const map = initializeMap('map');
const deckgl = new DeckOverlay({ layers: [] });

/**
 * Načte shapefile z dané URL a převede jej na GeoJSON
 * @param {string} url - URL souboru shapefile
 * @returns {Object|null} GeoJSON objekt nebo null v případě chyby
 */
async function loadShapefile(url) {
  try {
    const rawData = await load(url, ShapefileLoader);
    if (!rawData.prj || !Array.isArray(rawData.data)) {
      throw new Error('Neplatná struktura shapefile');
    }
    
    // Nastavení projekce a vytvoření funkce pro převod souřadnic
    proj4.defs('SOURCE_CRS', rawData.prj);
    const reprojectPoint = proj4('SOURCE_CRS', 'EPSG:4326');
    
    // Převod dat na GeoJSON
    return {
      type: 'FeatureCollection',
      features: rawData.data.map(feature => ({
        ...feature,
        geometry: reprojectGeometry(feature.geometry, reprojectPoint)
      }))
    };
  } catch (error) {
    console.error('Chyba při načítání shapefile:', error);
    return null;
  }
}

/**
 * Převede geometrii z původní projekce do WGS84
 * @param {Object} geometry - Geometrie k převodu
 * @param {Function} reprojectPoint - Funkce pro převod jednotlivých bodů
 * @returns {Object} Převedená geometrie
 */
function reprojectGeometry(geometry, reprojectPoint) {
  const reprojectCoords = coords => coords.map(ring =>
    ring.filter(coord => coord.every(Number.isFinite))
       .map(coord => {
         const [x, y, z] = reprojectPoint.forward(coord);
         return Number.isFinite(x) && Number.isFinite(y) ? [x, y, z] : null;
       })
       .filter(Boolean)
  );

  switch (geometry.type) {
    case 'Polygon':
      return { ...geometry, coordinates: reprojectCoords(geometry.coordinates) };
    case 'MultiPolygon':
      return { ...geometry, coordinates: geometry.coordinates.map(reprojectCoords) };
    default:
      console.warn('Nepodporovaný typ geometrie:', geometry.type);
      return geometry;
  }
}

/**
 * Aktualizuje polygonLayer
 * @param {Object} shapefileData - Data ze shapefile
 */
function updateLayers(shapefileData) {
  if (shapefileData) {
    deckgl.setProps({
      layers: [
        createPolygonLayer(shapefileData, 'shapefile-layer')
      ]
    });
  } else {
    console.error('Nepodařilo se načíst data shapefile');
  }
}



// Načtení dat a inicializace mapy po jejím načtení
map.on('load', async () => {
  const shapefileUrl = ''; // Zde je třeba doplnit cestu k souboru
  const shapefileData = await loadShapefile(shapefileUrl);
  updateLayers(shapefileData);
 
  const updateStats = createStatsCounter(map);
  updateStats();
});

// Přidání ovládacích prvků do mapy
map.addControl(deckgl);
map.addControl(new mapboxgl.NavigationControl());