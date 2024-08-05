import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox';
import mapboxgl from 'mapbox-gl';
import { initializeMap } from './mapSetup.js';
import { createPolygonLayer } from './layers.js';
import { load } from '@loaders.gl/core';
import { ShapefileLoader } from '@loaders.gl/shapefile';
import proj4 from 'proj4';
import { LightingEffect, AmbientLight, DirectionalLight } from '@deck.gl/core';

const map = initializeMap('map');
const deckgl = new DeckOverlay({ layers: [] });

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 0.7
});

const directionalLight = new DirectionalLight({
  color: [255, 255, 255],
  intensity: 1,
  direction: [-3, -3, -1]
});

const lightingEffect = new LightingEffect({ ambientLight, directionalLight });

async function loadShapefile(url) {
  try {
    const rawData = await load(url, ShapefileLoader);
    if (!rawData.prj || !Array.isArray(rawData.data)) {
      throw new Error('Invalid shapefile structure');
    }
    proj4.defs('SOURCE_CRS', rawData.prj);
    const reprojectPoint = proj4('SOURCE_CRS', 'EPSG:4326');
    
    const featureTypes = new Set(rawData.data.map(f => f.geometry?.type).filter(Boolean));
    console.log(`Loaded ${rawData.data.length} features of types:`, Array.from(featureTypes));

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

function updateLayers(buildingsData, terrainData) {
  if (buildingsData && terrainData) {
    deckgl.setProps({
      layers: [
        createPolygonLayer(terrainData, 'terrain-layer', [139, 69, 19]),
        createPolygonLayer(buildingsData, 'buildings-layer', [112, 156, 137])
      ],
      effects: [lightingEffect]
    });
  } else {
    console.error('Failed to load shapefile data');
  }
}

map.on('load', async () => {
  const [buildingsData, terrainData] = await Promise.all([
    loadShapefile('Krav_6-9/BD3_Krav69.shp'),
    loadShapefile('Krav_2-9_teren/TER_Krav_2-9_shp.shp')
  ]);
  updateLayers(buildingsData, terrainData);
});

map.addControl(deckgl);
map.addControl(new mapboxgl.NavigationControl());