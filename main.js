import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox';
import mapboxgl from 'mapbox-gl';
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

// Maximum area constraint (in square kilometers)
const MAX_AREA = 2;

// Function to update data
async function updateData() {
  try {
    // Get bounding box from map
    const bbox = getBoundingBoxFromMap(map);

    // Calculate area of bounding box (approximate)
    const area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]) * 111 * 111;

    if (area > MAX_AREA) {
      updateTextOverlay(`Area too large (${area.toFixed(2)} km²). Maximum allowed: ${MAX_AREA} km²`);
      return;
    }

    updateTextOverlay('Loading data...');

    // Construct query using template
    const query = OVERPASS_QUERY_TEMPLATE(bbox);

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
const debouncedUpdateData = debounce(updateData, 500);

map.on('load', function() {
  // Initial data load
  updateData();

  // Update data on map move end
  map.on('moveend', debouncedUpdateData);
});

// Add controls
map.addControl(deckgl);
map.addControl(new mapboxgl.NavigationControl());

function updateTextOverlay(text) {
  const overlay = document.getElementById('text-overlay');
  overlay.textContent = text;
}