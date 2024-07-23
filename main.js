import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox';
import mapboxgl from 'mapbox-gl';
import { initializeMap } from './mapSetup.js';
import { createGeoJsonLayer } from './layers.js';
import { getBoundingBoxFromMap } from './utils.js';

// Initialize map
const map = initializeMap('map');

// Initialize DeckGL overlay
const deckgl = new DeckOverlay({
  map
});

// Function to update data
async function loadData() {
  try {
    
  } catch (error) {
    console.error('Error loading map data:', error);
    // Implement user-friendly error handling here
  }
}

map.on('load', function() {
  // Initial data load
  loadData();
});

// Add controls
map.addControl(deckgl);
map.addControl(new mapboxgl.NavigationControl());