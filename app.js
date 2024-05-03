import {MapboxOverlay as DeckOverlay} from '@deck.gl/mapbox';
import {ScatterplotLayer, GeoJsonLayer} from '@deck.gl/layers';
import mapboxgl from 'mapbox-gl';
import osmtogeojson from 'osmtogeojson';

mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbXZvdCIsImEiOiJjbHJ0NHY1dmEwMm5wMmttdWhhNm8xcGQ4In0.-WyfuHtGFNdocq1s0-oazQ'

const MAP_STYLE = 'mapbox://styles/mapbox/light-v11';
const map = new mapboxgl.Map({
  container: 'map',
  style: MAP_STYLE,
  center: [-73.98543, 40.75004],
  pitch: 30,
  bearing: 0,
  zoom: 15
});

function queryOverpass(query) {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  const fullUrl = `${overpassUrl}?data=${encodeURIComponent(query)}`;

  return fetch(fullUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}

const scatterplotLayer = new ScatterplotLayer({
  id: 'scatterplot-layer',
  getPosition: cafe => [cafe.lon, cafe.lat],
  getRadius: 10, // radius of the dots, in pixels
  getFillColor: [255, 140, 0], // color of the dots
  radiusUnits: 'pixels',
});

const deckgl = new DeckOverlay({map, layers: [scatterplotLayer]});

map.on('load', function() {
  const bounds = map.getBounds();
  const bbox = [
    bounds.getSouth(), // latitude of the south edge
    bounds.getWest(), // longitude of the west edge
    bounds.getNorth(), // latitude of the north edge
    bounds.getEast() // longitude of the east edge
  ].join(', ');

  const query = `
  [out:json];
  (
    relation[building](${bbox});
    >;
    way[building](${bbox});
    >;
  );
  out;
`;

  queryOverpass(query)
    .then(data => {
      const buildings = osmtogeojson(data);
      addGeoJsonLayer(buildings);
    });
});

function addGeoJsonLayer(data) {
  const geoJsonLayer = new GeoJsonLayer({
    id: 'geojson-layer',
    data,
    stroked: true,
    filled: true,
    extruded: true,
    lineWidthMinPixels: 2,
    getFillColor: [150, 150, 150, 255],
    getElevation: e => {
      if (e.properties && e.properties.hasOwnProperty('building:levels')) {
        return e.properties['building:levels'] * 3;
      } else if (e.properties && e.properties.hasOwnProperty('height')) {
        return e.properties.height * 1;
      } else {
        return 3;
      }
    }
  });

  deckgl.setProps({layers: [geoJsonLayer]});
}

map.addControl(deckgl);
map.addControl(new mapboxgl.NavigationControl());