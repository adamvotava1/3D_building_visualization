import mapboxgl from 'mapbox-gl';
import { MAPBOX_ACCESS_TOKEN, MAP_STYLE, INITIAL_VIEW_STATE, TERRAIN_SOURCE } from './config.js';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

export function initializeMap(containerId) {
  const map = new mapboxgl.Map({
    container: containerId,
    style: MAP_STYLE,
    ...INITIAL_VIEW_STATE,
  });

  // Add the terrain source and enable terrain immediately after map initialization
  map.on('load', () => {
    map.addSource(TERRAIN_SOURCE, {
      'type': 'raster-dem',
      'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
      'tileSize': 512,
      'maxzoom': 14
    });
    
    // Enable terrain
    map.setTerrain({ 'source': TERRAIN_SOURCE });

  });

  return map;
}