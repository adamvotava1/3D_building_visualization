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

// Function to update text overlay
function updateTextOverlay(text) {
  const overlay = document.getElementById('text-overlay');
  overlay.innerHTML = text;
}

// Function to update data
async function updateData() {
  try {
    const startTime = performance.now();

    // Get bounding box from map
    const bbox = getBoundingBoxFromMap(map);

    // Construct query using template
    const query = OVERPASS_QUERY_TEMPLATE(bbox);

    // Fetch and process data
    const data = await queryOverpass(query);
    const buildings = osmtogeojson(data);

    const endTime = performance.now();
    const timeTaken = (endTime - startTime).toFixed(2);

    // Calculate data size (approximate)
    const dataSizeMB = (JSON.stringify(buildings).length / (1024 * 1024)).toFixed(2);

    // Count number of buildings
    const numberOfBuildings = buildings.features.length;

    // Update text overlay
    updateTextOverlay(`
      <strong>Data Statistics:</strong><br>
      Size: ${dataSizeMB} MB<br>
      Buildings: ${numberOfBuildings}<br>
      Fetch Time: ${timeTaken} ms
    `);

    // Create and set new layer
    const geoJsonLayer = createGeoJsonLayer(buildings);
    deckgl.setProps({ layers: [geoJsonLayer] });
  } catch (error) {
    console.error('Error loading map data:', error);
    updateTextOverlay('<strong>Error:</strong><br>Failed to load map data');
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