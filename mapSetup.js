import mapboxgl from 'mapbox-gl';
import { MAPBOX_ACCESS_TOKEN, MAP_STYLE, INITIAL_VIEW_STATE } from './config.js';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

export function initializeMap(containerId) {
  return new mapboxgl.Map({
    container: containerId,
    style: MAP_STYLE,
    ...INITIAL_VIEW_STATE
  });
}