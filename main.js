import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import osmtogeojson from 'osmtogeojson';
import { initializeMap } from './mapSetup.js';
import { queryOverpass } from './api.js';
import { createGeoJsonLayer } from './layers.js';
import { getBoundingBoxFromMap, calculateArea } from './utils.js';
import { OVERPASS_QUERY_TEMPLATE } from './config.js';

// Inicializace mapy
const map = initializeMap('map');

// Inicializace překrytí DeckGL
const deckgl = new DeckOverlay({ map });

// Maximální plocha pro dotazování dat (v km²)
const MAX_QUERY_AREA = 10;

// Časovač pro řízení načítání dat
let cooldownTimer = null;

const COOLDOWN_PERIOD = 1000; // 1000ms cooldown po zastavení pohybu

// Aktualizace dat na mapě
const updateData = async () => {
  try {
    const bbox = getBoundingBoxFromMap(map);
    const area = calculateArea(bbox);

    if (area > MAX_QUERY_AREA) {
      updateTextOverlay(`Pro zobrazení dat o budovách přibližte mapu. Aktuální plocha: ${area.toFixed(2)} km²`);
      return;
    }

    updateTextOverlay('Načítání dat...');

    const query = OVERPASS_QUERY_TEMPLATE(bbox.string);

    const data = await queryOverpass(query);

    if (!data || !data.elements) {
      throw new Error('Received invalid data from Overpass API');
    }

    const buildings = osmtogeojson(data);
   
    const geoJsonLayer = createGeoJsonLayer(buildings);
    deckgl.setProps({ layers: [geoJsonLayer] });

    updateTextOverlay(`Načteno ${buildings.features.length} prvků`);
  } catch (error) {
    console.error('Detailní chyba při načítání dat mapy:', error);
    updateTextOverlay(`Chyba při načítání dat: ${error.message}. Zkuste to prosím znovu.`);
  }
};

// Funkce pro resetování a nastavení časovače cooldown
const resetCooldownTimer = () => {
  clearTimeout(cooldownTimer);
  cooldownTimer = setTimeout(updateData, COOLDOWN_PERIOD);
};

// Události mapy
map.on('load', () => {
  updateData(); // Počáteční načtení dat
});

map.on('movestart', () => {
  clearTimeout(cooldownTimer);
});

map.on('moveend', resetCooldownTimer);

// Přidání ovládacích prvků
map.addControl(deckgl);
map.addControl(new MapboxGeocoder({ accessToken: mapboxgl.accessToken, mapboxgl }));
map.addControl(new mapboxgl.NavigationControl());

// Aktualizace textu
const updateTextOverlay = (text) => {
  const overlay = document.getElementById('text-overlay');
  overlay.textContent = text;
};