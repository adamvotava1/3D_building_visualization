export function getBoundingBoxFromMap(map) {
    const bounds = map.getBounds();
    return [
      bounds.getSouth(),
      bounds.getWest(),
      bounds.getNorth(),
      bounds.getEast()
    ].join(', ');
  }

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
  
      // Update FPS
      fpsElement.textContent = `FPS: ${fps}`;
  
      // Update map parameters
      const center = map.getCenter();
      const zoom = map.getZoom();
      const pitch = map.getPitch();
      const bearing = map.getBearing();
  
      centerElement.textContent = `Center: ${center.lng.toFixed(4)}, ${center.lat.toFixed(4)}`;
      zoomElement.textContent = `Zoom: ${zoom.toFixed(2)}`;
      pitchElement.textContent = `Pitch: ${pitch.toFixed(1)}°`;
      bearingElement.textContent = `Bearing: ${bearing.toFixed(1)}°`;
  
      requestAnimationFrame(updateStats);
    };
  
    return updateStats;
  }