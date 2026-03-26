import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isValidDigitalPostcode, getCoordinatesFromDigitalPostcode, getPostalAreaName, parseDigitalPostcode } from '@/lib/postcode';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address') || '';

  if (!address) {
    return NextResponse.json({ error: 'address parameter is required' }, { status: 400 });
  }

  const upperAddress = address.toUpperCase().trim();

  if (!isValidDigitalPostcode(upperAddress)) {
    return NextResponse.json({ error: 'Invalid digital address format. Expected: XXX-XXX-XXXXXX' }, { status: 400 });
  }

  // Check database first for exact match
  const dbResult = await pool.query(
    'SELECT * FROM addresses WHERE digital_code = $1',
    [upperAddress]
  );

  if (dbResult.rows.length > 0) {
    const row = dbResult.rows[0];
    return NextResponse.json({
      found: true,
      accuracy: 'exact',
      digitalAddress: row.digital_code,
      coordinates: { lat: row.latitude, lng: row.longitude },
      province: getPostalAreaName(row.province_code),
      provinceCode: row.province_code,
      streetName: row.street_name,
      description: row.description,
    });
  }

  // Check POIs
  const poiResult = await pool.query(
    'SELECT * FROM pois WHERE digital_code = $1 AND is_active = true',
    [upperAddress]
  );

  if (poiResult.rows.length > 0) {
    const poi = poiResult.rows[0];
    return NextResponse.json({
      found: true,
      accuracy: 'exact',
      digitalAddress: poi.digital_code,
      coordinates: { lat: poi.latitude, lng: poi.longitude },
      province: getPostalAreaName(poi.province_code || ''),
      name: poi.name,
      category: poi.category,
      address: poi.address,
    });
  }

  // Fall back to algorithmic approximation
  const coords = getCoordinatesFromDigitalPostcode(upperAddress);
  if (coords) {
    const parsed = parseDigitalPostcode(upperAddress);
    return NextResponse.json({
      found: true,
      accuracy: 'approximate',
      digitalAddress: upperAddress,
      coordinates: { lat: coords.latitude, lng: coords.longitude },
      province: getPostalAreaName(parsed?.provinceCode || ''),
      provinceCode: parsed?.provinceCode,
    });
  }

  return NextResponse.json({ found: false, error: 'Digital address not found' }, { status: 404 });
}
