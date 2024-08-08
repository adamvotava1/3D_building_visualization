import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox';
import mapboxgl from 'mapbox-gl';
import { initializeMap } from './mapSetup.js';
import { createPolygonLayer } from './layers.js';
import { load } from '@loaders.gl/core';
import { ShapefileLoader } from '@loaders.gl/shapefile';
import proj4 from 'proj4';
import { getBoundingBoxFromMap, createStatsCounter } from './utils.js';

const map = initializeMap('map');
const deckgl = new DeckOverlay({ layers: [] });

async function loadShapefile(url) {
  try {
    const rawData = await load(url, ShapefileLoader);
    if (!rawData.prj || !Array.isArray(rawData.data)) {
      throw new Error('Invalid shapefile structure');
    }
    proj4.defs('SOURCE_CRS', rawData.prj);
    const reprojectPoint = proj4('SOURCE_CRS', 'EPSG:4326');
    return {
      type: 'FeatureCollection',
      features: rawData.data.map(feature => ({
        ...feature,
        geometry: reprojectGeometry(feature.geometry, reprojectPoint)
      }))
    };
  } catch (error) {
    console.error('Error loading shapefile:', error);
    return null;
  }
}

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
      console.warn('Unsupported geometry type:', geometry.type);
      return geometry;
  }
}

function updateLayers(buildingsData, bridgesData) {
  if (buildingsData && bridgesData) {
    deckgl.setProps({
      layers: [
        createPolygonLayer(buildingsData, 'buildings-layer'),
        createPolygonLayer(bridgesData, 'bridges-layer') // Orange color for bridges
      ]
    });
  } else {
    console.error('Failed to load shapefile data');
  }
}

function animateCamera() {
  let time = 0;
  function animate() {
    time += 0.01; // Adjust this value to change the speed
    // Calculate new pitch and bearing
    const newPitch = 30 + Math.sin(time) * 20; // Pitch will oscillate between 10 and 50 degrees
    const newBearing = (time * 30) % 360; // Bearing will rotate continuously
    map.easeTo({
      pitch: newPitch,
      bearing: newBearing,
      duration: 100, // Adjust this value to change the smoothness
      easing: (t) => t
    });
    requestAnimationFrame(animate);
  }
  animate();
}

map.on('load', async () => {
  const buildingsData = await loadShapefile('Prah_2-1/BD3_Prah21.shp');
  const bridgesData = await loadShapefile('mosty_shp/mosty.shp');
  updateLayers(buildingsData, bridgesData);
  const updateStats = createStatsCounter(map);
  updateStats();
  // Start the camera movement after the map has loaded
  //animateCamera();
});

map.addControl(deckgl);
map.addControl(new mapboxgl.NavigationControl());