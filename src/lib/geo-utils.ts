export function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  let inside = false;
  const [x, y] = point;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function isPointInMultiPolygon(point: [number, number], multiPolygon: [number, number][][]): boolean {
  for (const polygon of multiPolygon) {
    if (isPointInPolygon(point, polygon)) return true;
  }
  return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function findProvinceForPoint(point: [number, number], geoJSON: any): {
  code: string; name: string; postalArea: string;
} | null {
  if (geoJSON.type !== 'FeatureCollection') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const feature of geoJSON.features) {
    if (feature.geometry.type === 'Polygon') {
      if (isPointInPolygon(point, feature.geometry.coordinates[0])) {
        return { code: feature.properties.PC_code, name: feature.properties.PR_name, postalArea: feature.properties.PC_name };
      }
    } else if (feature.geometry.type === 'MultiPolygon') {
      for (const polygon of feature.geometry.coordinates) {
        if (isPointInMultiPolygon(point, polygon)) {
          return { code: feature.properties.PC_code, name: feature.properties.PR_name, postalArea: feature.properties.PC_name };
        }
      }
    }
  }
  return null;
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
