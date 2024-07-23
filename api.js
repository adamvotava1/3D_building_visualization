const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export async function queryOverpass(query) {
  const fullUrl = `${OVERPASS_URL}?data=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}