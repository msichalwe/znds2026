import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isValidDigitalPostcode, getCoordinatesFromDigitalPostcode, parseDigitalPostcode, getPostalAreaName } from '@/lib/postcode';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  if (!q) {
    return NextResponse.json({ error: 'q parameter is required' }, { status: 400 });
  }

  const results: Array<Record<string, unknown>> = [];

  // Check if query is a digital address
  if (isValidDigitalPostcode(q.toUpperCase())) {
    const coords = getCoordinatesFromDigitalPostcode(q.toUpperCase());
    const parsed = parseDigitalPostcode(q.toUpperCase());
    if (coords && parsed) {
      results.push({
        type: 'digital_address',
        digitalAddress: q.toUpperCase(),
        coordinates: { lat: coords.latitude, lng: coords.longitude },
        province: getPostalAreaName(parsed.provinceCode),
        accuracy: 'approximate',
      });
    }

    // Check for exact match in DB
    const dbAddr = await pool.query('SELECT * FROM addresses WHERE digital_code = $1', [q.toUpperCase()]);
    if (dbAddr.rows.length > 0) {
      results[0] = {
        ...results[0],
        coordinates: { lat: dbAddr.rows[0].latitude, lng: dbAddr.rows[0].longitude },
        accuracy: 'exact',
        streetName: dbAddr.rows[0].street_name,
      };
    }
  }

  // Search POIs by name
  const poiResults = await pool.query(
    `SELECT * FROM pois WHERE is_active = true
     AND (name ILIKE $1 OR description ILIKE $1 OR address ILIKE $1 OR digital_code ILIKE $2)
     ORDER BY name ASC LIMIT $3`,
    [`%${q}%`, `%${q.toUpperCase()}%`, limit]
  );

  for (const poi of poiResults.rows) {
    results.push({
      type: 'poi',
      id: poi.id,
      name: poi.name,
      category: poi.category,
      digitalAddress: poi.digital_code,
      coordinates: { lat: poi.latitude, lng: poi.longitude },
      address: poi.address,
      description: poi.description,
    });
  }

  // Search provinces/districts
  const provResults = await pool.query(
    `SELECT p.name as province_name, p.code, p.bounds, d.name as district_name, d.code as district_code
     FROM provinces p
     LEFT JOIN districts d ON d.province_id = p.id
     WHERE p.name ILIKE $1 OR d.name ILIKE $1 OR p.code ILIKE $2
     LIMIT $3`,
    [`%${q}%`, `%${q.toUpperCase()}%`, limit]
  );

  for (const row of provResults.rows) {
    const bounds = row.bounds as { north: number; south: number; east: number; west: number } | null;
    results.push({
      type: 'region',
      province: row.province_name,
      provinceCode: row.code,
      district: row.district_name,
      districtCode: row.district_code,
      coordinates: bounds ? {
        lat: (bounds.north + bounds.south) / 2,
        lng: (bounds.east + bounds.west) / 2,
      } : null,
    });
  }

  // Log search
  await pool.query(
    'INSERT INTO search_history (query, search_type, result_count) VALUES ($1, $2, $3)',
    [q, isValidDigitalPostcode(q.toUpperCase()) ? 'digital_address' : 'location', results.length]
  ).catch(() => {});

  return NextResponse.json({ query: q, results, total: results.length });
}
