export function getBoundingBoxFromMap(map) {
  const bounds = map.getBounds();
  return {
    array: [
      bounds.getSouth(),
      bounds.getWest(),
      bounds.getNorth(),
      bounds.getEast()
    ],
    string: [
      bounds.getSouth(),
      bounds.getWest(),
      bounds.getNorth(),
      bounds.getEast()
    ].join(', ')
  };
}