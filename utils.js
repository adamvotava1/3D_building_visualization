/**
 * Získá ohraničující obdélník z aktuálního zobrazení mapy
 * @param {Object} map - Instance mapy
 * @returns {string} Řetězec reprezentující ohraničující obdélník (jih, západ, sever, východ)
 */
export function getBoundingBoxFromMap(map) {
  const bounds = map.getBounds();
  return [
    bounds.getSouth(),
    bounds.getWest(),
    bounds.getNorth(),
    bounds.getEast()
  ].join(', ');
}

/**
 * Vytváří a aktualizuje počítadlo statistik pro mapu
 * @param {Object} map - Instance mapy
 * @returns {Function} Funkce pro aktualizaci statistik
 */
export function createStatsCounter(map) {
  let lastTime = performance.now();
  let frames = 0;
  let fps = 0;

  const statsDiv = document.getElementById('stats-counter');
  const fpsElement = statsDiv.children[0];
  const centerElement = statsDiv.children[1];
  const zoomElement = statsDiv.children[2];
  const pitchElement = statsDiv.children[3];
  const bearingElement = statsDiv.children[4];

  const updateStats = () => {
    const now = performance.now();
    frames++;

    if (now >= lastTime + 1000) {
      fps = Math.round((frames * 1000) / (now - lastTime));
      lastTime = now;
      frames = 0;
    }

    // Aktualizace FPS
    fpsElement.textContent = `FPS: ${fps}`;

    // Aktualizace parametrů mapy
    const center = map.getCenter();
    const zoom = map.getZoom();
    const pitch = map.getPitch();
    const bearing = map.getBearing();

    centerElement.textContent = `Střed: ${center.lng.toFixed(4)}, ${center.lat.toFixed(4)}`;
    zoomElement.textContent = `Přiblížení: ${zoom.toFixed(2)}`;
    pitchElement.textContent = `Náklon: ${pitch.toFixed(1)}°`;
    bearingElement.textContent = `Natočení: ${bearing.toFixed(1)}°`;

    requestAnimationFrame(updateStats);
  };

  return updateStats;
}



function reprojectGeometry(geometry, reprojectPoint) {
  const reprojectCoords = coords => coords.map(ring =>
    ring.map(coord => {
      const [x, y, z] = reprojectPoint.forward(coord);
      return [x, y, z];
    })
  );

  if (geometry.type === 'Polygon') {
    return {
      ...geometry,
      coordinates: reprojectCoords(geometry.coordinates)
    };
  } else if (geometry.type === 'MultiPolygon') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map(reprojectCoords)
    };
  }
  
  return geometry;
}
