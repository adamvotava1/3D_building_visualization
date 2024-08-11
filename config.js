// Přístupový token pro Mapbox API
export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYWRhbXZvdCIsImEiOiJjbHJ0NHY1dmEwMm5wMmttdWhhNm8xcGQ4In0.-WyfuHtGFNdocq1s0-oazQ';

// Styl mapy
export const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12';

// Počáteční nastavení pohledu mapy
export const INITIAL_VIEW_STATE = {
  center: [14.4375, 50.1223], // Zeměpisná délka a šířka středu mapy
  pitch: 55, // Náklon mapy ve stupních
  bearing: 26, // Natočení mapy ve stupních
  zoom: 15 // Úroveň přiblížení
};

// Identifikátor zdroje terénu
export const TERRAIN_SOURCE = 'mapbox-dem';