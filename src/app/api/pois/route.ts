import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateDigitalPostcode, getProvinceFromCoordinates } from '@/lib/postcode';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const province = searchParams.get('province');
  const area_id = searchParams.get('area_id');
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');
  const radius = parseFloat(searchParams.get('radius') || '10');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = 'SELECT p.* FROM pois p';
  const params: (string | number)[] = [];
  const conditions: string[] = ['p.is_active = true'];
  let paramIndex = 1;

  if (area_id) {
    query += ' JOIN poi_area_items pai ON pai.poi_id = p.id';
    conditions.push(`pai.area_id = $${paramIndex++}`);
    params.push(area_id);
  }

  if (category) {
    conditions.push(`p.category = $${paramIndex++}`);
    params.push(category);
  }

  if (province) {
    conditions.push(`p.province_code = $${paramIndex++}`);
    params.push(province.toUpperCase());
  }

  if (!isNaN(lat) && !isNaN(lng)) {
    const latRange = radius / 111.0;
    const lngRange = radius / (111.0 * Math.cos(lat * Math.PI / 180));
    conditions.push(`p.latitude BETWEEN $${paramIndex++} AND $${paramIndex++}`);
    conditions.push(`p.longitude BETWEEN $${paramIndex++} AND $${paramIndex++}`);
    params.push(lat - latRange, lat + latRange, lng - lngRange, lng + lngRange);
  }

  query += ` WHERE ${conditions.join(' AND ')} ORDER BY p.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) FROM pois p';
  if (area_id) {
    countQuery += ' JOIN poi_area_items pai ON pai.poi_id = p.id';
  }
  const countParams = params.slice(0, -2);
  countQuery += ` WHERE ${conditions.join(' AND ')}`;
  const countResult = await pool.query(countQuery, countParams);

  return NextResponse.json({
    pois: result.rows,
    total: parseInt(countResult.rows[0].count),
    limit,
    offset,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, latitude, longitude, address, phone, website, area_id, metadata } = body;

    if (!name || !latitude || !longitude) {
      return NextResponse.json({ error: 'name, latitude, and longitude are required' }, { status: 400 });
    }

    const digitalCode = generateDigitalPostcode(latitude, longitude);
    const province = getProvinceFromCoordinates(latitude, longitude);

    const result = await pool.query(
      `INSERT INTO pois (name, description, category, latitude, longitude, digital_code, province_code, address, phone, website, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [name, description || null, category || 'general', latitude, longitude, digitalCode, province.code, address || null, phone || null, website || null, JSON.stringify(metadata || {})]
    );

    const poi = result.rows[0];

    // If area_id provided, link to area
    if (area_id) {
      await pool.query(
        'INSERT INTO poi_area_items (area_id, poi_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [area_id, poi.id]
      );
    }

    return NextResponse.json({ success: true, poi });
  } catch (error) {
    console.error('POI creation error:', error);
    return NextResponse.json({ error: 'Failed to create POI' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  await pool.query('UPDATE pois SET is_active = false WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}
