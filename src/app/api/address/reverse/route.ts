import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateDigitalPostcode, getProvinceFromCoordinates, getPostalAreaName } from '@/lib/postcode';
import { haversineDistance } from '@/lib/geo-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');
  const radius = parseFloat(searchParams.get('radius') || '0.5'); // km

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  // Find nearby POIs
  const nearbyPois = await pool.query(
    `SELECT *,
      (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)))) AS distance
     FROM pois
     WHERE is_active = true
     AND latitude BETWEEN $1 - $3 AND $1 + $3
     AND longitude BETWEEN $2 - $4 AND $2 + $4
     ORDER BY distance ASC
     LIMIT 10`,
    [lat, lng, radius / 111.0, radius / (111.0 * Math.cos(lat * Math.PI / 180))]
  );

  // Generate digital address for this point
  const digitalAddress = generateDigitalPostcode(lat, lng);
  const province = getProvinceFromCoordinates(lat, lng);

  return NextResponse.json({
    digitalAddress,
    province: province.name,
    provinceCode: province.code,
    postalArea: getPostalAreaName(province.code),
    coordinates: { lat, lng },
    nearbyPois: nearbyPois.rows.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      digitalCode: p.digital_code,
      distance: haversineDistance(lat, lng, p.latitude, p.longitude).toFixed(2) + ' km',
      coordinates: { lat: p.latitude, lng: p.longitude },
    })),
  });
}
