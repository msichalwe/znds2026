import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [addresses, pois, areas, searches, provinces] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM addresses'),
    pool.query('SELECT COUNT(*) FROM pois WHERE is_active = true'),
    pool.query('SELECT COUNT(*) FROM poi_areas WHERE is_active = true'),
    pool.query('SELECT COUNT(*) FROM search_history'),
    pool.query(`
      SELECT p.code, p.name,
        (SELECT COUNT(*) FROM addresses a WHERE a.province_code = p.code) as address_count,
        (SELECT COUNT(*) FROM pois po WHERE po.province_code = p.code AND po.is_active = true) as poi_count
      FROM provinces p ORDER BY p.name
    `),
  ]);

  const recentSearches = await pool.query(
    'SELECT query, search_type, result_count, created_at FROM search_history ORDER BY created_at DESC LIMIT 10'
  );

  const categoryStats = await pool.query(
    'SELECT category, COUNT(*) as count FROM pois WHERE is_active = true GROUP BY category ORDER BY count DESC'
  );

  return NextResponse.json({
    totalAddresses: parseInt(addresses.rows[0].count),
    totalPois: parseInt(pois.rows[0].count),
    totalAreas: parseInt(areas.rows[0].count),
    totalSearches: parseInt(searches.rows[0].count),
    provinceStats: provinces.rows,
    recentSearches: recentSearches.rows,
    categoryStats: categoryStats.rows,
  });
}
