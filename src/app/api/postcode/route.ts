import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateDigitalPostcode, getProvinceFromCoordinates, getSectorCode, getPostalAreaName } from '@/lib/postcode';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  if (lat < -18.5 || lat > -8 || lng < 21.5 || lng > 33.5) {
    return NextResponse.json({ error: 'Coordinates outside Zambia' }, { status: 400 });
  }

  const digitalAddress = generateDigitalPostcode(lat, lng);
  const province = getProvinceFromCoordinates(lat, lng);
  const sectorCode = getSectorCode(lat, lng);
  const postalArea = getPostalAreaName(province.code);

  // Check if this address already exists
  const existing = await pool.query('SELECT * FROM addresses WHERE digital_code = $1', [digitalAddress]);

  if (existing.rows.length === 0) {
    await pool.query(
      'INSERT INTO addresses (digital_code, latitude, longitude, province_code, sector_code) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (digital_code) DO NOTHING',
      [digitalAddress, lat, lng, province.code, sectorCode]
    );
  }

  return NextResponse.json({
    digitalAddress,
    postcode: province.code,
    sectorCode,
    postalArea,
    provinceName: province.name,
    coordinates: { lat, lng },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { lat, lng } = body;

  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  if (lat < -18.5 || lat > -8 || lng < 21.5 || lng > 33.5) {
    return NextResponse.json({ error: 'Coordinates outside Zambia' }, { status: 400 });
  }

  const digitalAddress = generateDigitalPostcode(lat, lng);
  const province = getProvinceFromCoordinates(lat, lng);
  const sectorCode = getSectorCode(lat, lng);
  const postalArea = getPostalAreaName(province.code);

  await pool.query(
    'INSERT INTO addresses (digital_code, latitude, longitude, province_code, sector_code) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (digital_code) DO NOTHING',
    [digitalAddress, lat, lng, province.code, sectorCode]
  );

  return NextResponse.json({
    digitalAddress,
    postcode: province.code,
    sectorCode,
    postalArea,
    provinceName: province.name,
    coordinates: { lat, lng },
  });
}
