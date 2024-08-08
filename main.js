import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import osmtogeojson from 'osmtogeojson';
import { initializeMap } from './mapSetup.js';
import { queryOverpass } from './api.js';
import { createGeoJsonLayer } from './layers.js';
import { getBoundingBoxFromMap } from './utils.js';
import { OVERPASS_QUERY_TEMPLATE } from './config.js';

// Initialize map
const map = initializeMap('map');

// Initialize DeckGL overlay
const deckgl = new DeckOverlay({
  map
});

// Debounce function
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

const MAX_QUERY_AREA = 10; // Maximum area for querying data

async function updateData() {
  try {
    const bbox = getBoundingBoxFromMap(map);

    const latDiff = Math.abs(bbox.array[2] - bbox.array[0]);
    const lonDiff = Math.abs(bbox.array[3] - bbox.array[1]);
    const area = latDiff * lonDiff * 111 * 111;

    console.log(`Current area: ${area.toFixed(2)} km²`);
    console.log(`MAX_QUERY_AREA: ${MAX_QUERY_AREA} km²`);

    if (area > MAX_QUERY_AREA) {
      updateTextOverlay(`Please zoom in to view building data. Current area: ${area.toFixed(2)} km²`);
      return;
    }

    updateTextOverlay('Loading data...');

    // Construct query using template
    const query = OVERPASS_QUERY_TEMPLATE(bbox.string);
    // Fetch and process data
    const data = await queryOverpass(query);
    const buildings = osmtogeojson(data);
    
    // Create and set new layer
    const geoJsonLayer = createGeoJsonLayer(buildings);
    deckgl.setProps({ layers: [geoJsonLayer] });
    updateTextOverlay(`Loaded ${buildings.features.length} features`);
  } catch (error) {
    console.error('Error loading map data:', error);
    updateTextOverlay('Error loading data. Please try again.');
  }
}

// Debounced update function
const debouncedUpdateData = debounce(updateData, 1000);

map.on('load', function() {
  // Initial data load
  updateData();

  // Update data on map move end
  map.on('moveend', debouncedUpdateData);
});

// Add controls
map.addControl(deckgl);

map.addControl(
  new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl
  })
);
map.addControl(new mapboxgl.NavigationControl());

function updateTextOverlay(text) {
  const overlay = document.getElementById('text-overlay');
  overlay.textContent = text;
}