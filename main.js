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

// Function to update data
async function updateData() {
  try {
    // Get bounding box from map
    const bbox = getBoundingBoxFromMap(map);
    // Construct query using template
    const query = OVERPASS_QUERY_TEMPLATE(bbox);
    // Fetch and process data
    const data = await queryOverpass(query);
    const buildings = osmtogeojson(data);
    // Create and set new layer
    const geoJsonLayer = createGeoJsonLayer(buildings);
    deckgl.setProps({ layers: [geoJsonLayer] });
  } catch (error) {
    console.error('Error loading map data:', error);
    // Implement user-friendly error handling here
  }
}

map.on('load', function() {
  // Initial data load
  updateData();

  // Update data on map move end
  map.on('moveend', updateData);
});

// Add controls
map.addControl(deckgl);
map.addControl(new mapboxgl.NavigationControl());

function updateTextOverlay(text) {
    const overlay = document.getElementById('text-overlay');
    overlay.textContent = text;
  }