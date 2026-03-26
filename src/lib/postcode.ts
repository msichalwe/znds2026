/**
 * Zambia Digital Addressing System
 * Generates unique digital addresses in format: PROVINCE-SECTOR-UNIQUE
 * Example: LSA-K28-184370
 */

export const zambiaProvinces = [
  { name: 'LUSAKA', code: 'LSA', bounds: { north: -14.8, south: -16.0, west: 27.8, east: 30.0 } },
  { name: 'COPPERBELT', code: 'CPB', bounds: { north: -12.3, south: -13.9, west: 26.8, east: 29.0 } },
  { name: 'MUCHINGA', code: 'MUG', bounds: { north: -10.0, south: -13.2, west: 30.0, east: 33.5 } },
  { name: 'NORTHERN', code: 'NOR', bounds: { north: -8.5, south: -11.5, west: 29.0, east: 31.5 } },
  { name: 'EASTERN', code: 'EAS', bounds: { north: -12.0, south: -15.0, west: 30.5, east: 33.5 } },
  { name: 'CENTRAL', code: 'CEN', bounds: { north: -12.5, south: -15.5, west: 26.5, east: 30.5 } },
  { name: 'SOUTHERN', code: 'SOU', bounds: { north: -15.5, south: -18.0, west: 25.5, east: 29.0 } },
  { name: 'WESTERN', code: 'WES', bounds: { north: -13.5, south: -17.5, west: 22.0, east: 25.5 } },
  { name: 'NORTH-WESTERN', code: 'NWE', bounds: { north: -10.5, south: -13.5, west: 23.5, east: 27.0 } },
  { name: 'LUAPULA', code: 'LUA', bounds: { north: -8.5, south: -12.5, west: 28.0, east: 30.0 } },
];

export function getProvinceFromCoordinates(lat: number, lng: number): { code: string; name: string } {
  for (const province of zambiaProvinces) {
    const { bounds } = province;
    if (lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east) {
      return { code: province.code, name: province.name };
    }
  }
  return { code: 'ZMB', name: 'ZAMBIA' };
}

export function getSectorCode(lat: number, lng: number): string {
  const latSector = String.fromCharCode(65 + Math.abs(Math.floor(lat * 10) % 26));
  const lngSector = Math.abs(Math.floor(lng * 10) % 100).toString().padStart(2, '0');
  return `${latSector}${lngSector}`;
}

export function getUniqueNumber(lat: number, lng: number): string {
  // Last 3 decimal digits of longitude + last 3 decimal digits of latitude
  const lngStr = Math.abs(lng).toFixed(6);
  const latStr = Math.abs(lat).toFixed(6);
  const lngDecimals = lngStr.split('.')[1] || '000000';
  const latDecimals = latStr.split('.')[1] || '000000';
  const last3Lng = lngDecimals.slice(-3);
  const last3Lat = latDecimals.slice(-3);
  return `${last3Lng}${last3Lat}`;
}

export function generateDigitalPostcode(lat: number, lng: number): string {
  const province = getProvinceFromCoordinates(lat, lng);
  const sectorCode = getSectorCode(lat, lng);
  const uniqueId = getUniqueNumber(lat, lng);
  return `${province.code}-${sectorCode}-${uniqueId}`;
}

export function isValidDigitalPostcode(code: string): boolean {
  const patterns = [
    /^[A-Z]{3}-[A-Z0-9]{3}-[0-9]{6}$/,
    /^[A-Z]{3}-[A-Z0-9]{3}-[0-9]{3}$/,
    /^[A-Z]{3}-[A-Z0-9]{2,3}-[A-Z0-9]{1,6}$/,
  ];
  return patterns.some(pattern => pattern.test(code));
}

export function getPostalAreaName(provinceCode: string): string {
  const province = zambiaProvinces.find(p => p.code === provinceCode);
  return province ? province.name : 'ZAMBIA';
}

export function parseDigitalPostcode(digitalAddress: string): {
  provinceCode: string; sectorCode: string; uniqueId: string;
} | null {
  if (!isValidDigitalPostcode(digitalAddress)) return null;
  const parts = digitalAddress.split('-');
  return { provinceCode: parts[0], sectorCode: parts[1], uniqueId: parts[2] };
}

export function getCoordinatesFromDigitalPostcode(digitalAddress: string): {
  latitude: number; longitude: number; accuracy: 'approximate';
} | null {
  const parsed = parseDigitalPostcode(digitalAddress);
  if (!parsed) return null;

  const province = zambiaProvinces.find(p => p.code === parsed.provinceCode);
  if (!province) return null;

  const { bounds } = province;
  const latChar = parsed.sectorCode.charAt(0);
  const lngDigits = parsed.sectorCode.substring(1);

  const latOffset = (latChar.charCodeAt(0) - 65) / 10;
  const lngOffset = parseInt(lngDigits) / 100;

  const centerLat = (bounds.north + bounds.south) / 2;
  const centerLng = (bounds.east + bounds.west) / 2;

  return {
    latitude: centerLat + latOffset,
    longitude: centerLng + lngOffset,
    accuracy: 'approximate',
  };
}
