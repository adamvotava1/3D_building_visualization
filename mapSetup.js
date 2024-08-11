import mapboxgl from 'mapbox-gl';
import { MAPBOX_ACCESS_TOKEN, MAP_STYLE, INITIAL_VIEW_STATE, TERRAIN_SOURCE } from './config.js';

// Nastavení přístupového tokenu pro Mapbox
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

/**
 * Inicializuje a nastavuje mapu
 * @param {string} containerId - ID HTML elementu pro umístění mapy
 * @returns {Object} Instance mapy
 */
export function initializeMap(containerId) {
  const map = new mapboxgl.Map({
    container: containerId,
    style: MAP_STYLE,
    ...INITIAL_VIEW_STATE,
  });

  // Přidání zdroje terénu a jeho aktivace po načtení mapy
  map.on('load', () => {
    map.addSource(TERRAIN_SOURCE, {
      'type': 'raster-dem',
      'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
      'tileSize': 512,
      'maxzoom': 17
    });
   
    // Aktivace terénu
    map.setTerrain({ 'source': TERRAIN_SOURCE });
  });

  return map;
}