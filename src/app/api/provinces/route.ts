import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await pool.query(`
    SELECT p.*,
      (SELECT COUNT(*) FROM districts d WHERE d.province_id = p.id) as district_count,
      (SELECT COUNT(*) FROM addresses a WHERE a.province_code = p.code) as address_count,
      (SELECT COUNT(*) FROM pois po WHERE po.province_code = p.code AND po.is_active = true) as poi_count
    FROM provinces p
    ORDER BY p.name ASC
  `);

  const districts = await pool.query('SELECT * FROM districts ORDER BY name ASC');

  const provinces = result.rows.map(p => ({
    ...p,
    districts: districts.rows.filter(d => d.province_id === p.id),
  }));

  return NextResponse.json({ provinces });
}
