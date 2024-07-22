export function getBoundingBoxFromMap(map) {
    const bounds = map.getBounds();
    return [
      bounds.getSouth(),
      bounds.getWest(),
      bounds.getNorth(),
      bounds.getEast()
    ].join(', ');
  }