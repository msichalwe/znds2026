import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const active_only = searchParams.get('active_only') !== 'false';

  let query = `SELECT a.*,
    (SELECT COUNT(*) FROM poi_area_items pai WHERE pai.area_id = a.id) as poi_count
    FROM poi_areas a WHERE 1=1`;
  const params: (string | boolean)[] = [];
  let idx = 1;

  if (active_only) {
    query += ` AND a.is_active = $${idx++}`;
    params.push(true);
  }

  if (type) {
    query += ` AND a.area_type = $${idx++}`;
    params.push(type);
  }

  query += ' ORDER BY a.created_at DESC';

  const result = await pool.query(query, params);
  return NextResponse.json({ areas: result.rows });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, area_type, bounds, center_lat, center_lng, color, start_date, end_date, metadata } = body;

    if (!name || !bounds || !center_lat || !center_lng) {
      return NextResponse.json({ error: 'name, bounds, center_lat, and center_lng are required' }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO poi_areas (name, description, area_type, bounds, center_lat, center_lng, color, start_date, end_date, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, description || null, area_type || 'zone', JSON.stringify(bounds), center_lat, center_lng, color || '#3B82F6', start_date || null, end_date || null, JSON.stringify(metadata || {})]
    );

    return NextResponse.json({ success: true, area: result.rows[0] });
  } catch (error) {
    console.error('Area creation error:', error);
    return NextResponse.json({ error: 'Failed to create area' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const fields: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (['name', 'description', 'area_type', 'color', 'is_active', 'start_date', 'end_date'].includes(key)) {
        fields.push(`${key} = $${idx++}`);
        params.push(value);
      } else if (key === 'bounds' || key === 'metadata') {
        fields.push(`${key} = $${idx++}`);
        params.push(JSON.stringify(value));
      } else if (key === 'center_lat' || key === 'center_lng') {
        fields.push(`${key} = $${idx++}`);
        params.push(value);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    fields.push(`updated_at = NOW()`);
    params.push(id);

    const result = await pool.query(
      `UPDATE poi_areas SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    return NextResponse.json({ success: true, area: result.rows[0] });
  } catch (error) {
    console.error('Area update error:', error);
    return NextResponse.json({ error: 'Failed to update area' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  await pool.query('DELETE FROM poi_areas WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}
