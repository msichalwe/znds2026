'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface POI {
  id: string; name: string; category: string; latitude: number; longitude: number; digital_code: string; province_code: string; description: string; address: string; is_active: boolean; created_at: string;
}

interface Area {
  id: string; name: string; area_type: string; color: string; center_lat: number; center_lng: number; description: string; is_active: boolean; start_date: string; end_date: string; poi_count: string; created_at: string;
}

interface Stats {
  totalAddresses: number; totalPois: number; totalAreas: number; totalSearches: number;
  provinceStats: Array<{ code: string; name: string; address_count: string; poi_count: string }>;
  recentSearches: Array<{ query: string; search_type: string; result_count: number; created_at: string }>;
  categoryStats: Array<{ category: string; count: string }>;
}

export default function AdminPage() {
  const [tab, setTab] = useState<'dashboard' | 'pois' | 'areas'>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [pois, setPois] = useState<POI[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [poiFilter, setPoiFilter] = useState('');

  const loadData = useCallback(async () => {
    const [s, p, a] = await Promise.all([
      fetch('/api/stats').then(r => r.json()).catch(() => null),
      fetch('/api/pois?limit=200').then(r => r.json()).catch(() => ({ pois: [] })),
      fetch('/api/areas?active_only=false').then(r => r.json()).catch(() => ({ areas: [] })),
    ]);
    setStats(s); setPois(p.pois || []); setAreas(a.areas || []);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const deletePoi = async (id: string) => {
    if (!confirm('Delete this POI?')) return;
    await fetch(`/api/pois?id=${id}`, { method: 'DELETE' });
    setPois(prev => prev.filter(p => p.id !== id));
  };

  const deleteArea = async (id: string) => {
    if (!confirm('Delete this area?')) return;
    await fetch(`/api/areas?id=${id}`, { method: 'DELETE' });
    setAreas(prev => prev.filter(a => a.id !== id));
  };

  const filteredPois = poiFilter ? pois.filter(p => p.category === poiFilter) : pois;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              </div>
              <span className="text-gray-900 font-semibold text-sm">ZNDS</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500 text-sm">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/map" className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">Map</Link>
            <Link href="/api-docs" className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">API</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
          {(['dashboard', 'pois', 'areas'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 text-sm rounded-lg font-medium transition-all capitalize ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              {t === 'pois' ? 'Points of Interest' : t}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Digital Addresses', value: stats.totalAddresses, color: 'emerald' },
                { label: 'Points of Interest', value: stats.totalPois, color: 'blue' },
                { label: 'Active Areas', value: stats.totalAreas, color: 'purple' },
                { label: 'Total Searches', value: stats.totalSearches, color: 'amber' },
              ].map(s => {
                const colors = { emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700', blue: 'bg-blue-50 border-blue-100 text-blue-700', purple: 'bg-purple-50 border-purple-100 text-purple-700', amber: 'bg-amber-50 border-amber-100 text-amber-700' };
                return (
                  <div key={s.label} className={`${colors[s.color as keyof typeof colors]} border rounded-xl p-5`}>
                    <div className="text-xs text-gray-500 mb-2">{s.label}</div>
                    <div className="text-3xl font-bold">{s.value.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Province Coverage</h3>
                <div className="space-y-2">
                  {stats.provinceStats.map(p => (
                    <div key={p.code} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-emerald-700 font-bold w-8">{p.code}</span>
                        <span className="text-sm text-gray-700">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{p.address_count} addr</span>
                        <span>{p.poi_count} POIs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">POI Categories</h3>
                  {stats.categoryStats.length === 0 ? <p className="text-gray-400 text-sm">No POIs yet</p> : (
                    <div className="space-y-2">
                      {stats.categoryStats.map(c => (
                        <div key={c.category} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{c.category}</span>
                          <span className="text-sm font-mono text-gray-400">{c.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Recent Searches</h3>
                  {stats.recentSearches.length === 0 ? <p className="text-gray-400 text-sm">No searches yet</p> : (
                    <div className="space-y-2">
                      {stats.recentSearches.slice(0, 8).map((s, i) => (
                        <div key={i} className="flex items-center justify-between py-1">
                          <span className="text-sm text-gray-600 truncate max-w-[200px]">{s.query}</span>
                          <span className="text-xs text-gray-300">{s.result_count} results</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'pois' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">Points of Interest</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{filteredPois.length} total</span>
              </div>
              <div className="flex items-center gap-2">
                <select value={poiFilter} onChange={e => setPoiFilter(e.target.value)} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none">
                  <option value="">All categories</option>
                  {['general','hospital','school','bank','restaurant','hotel','government','church','market','event','transport','park'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                <Link href="/map" className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors font-medium">+ Add on Map</Link>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Name</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Category</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Digital Code</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Province</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Coordinates</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPois.map(poi => (
                    <tr key={poi.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-900 font-medium">{poi.name}</td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{poi.category}</td>
                      <td className="px-4 py-3 font-mono text-xs text-emerald-700 font-bold">{poi.digital_code}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{poi.province_code}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{poi.latitude?.toFixed(4)}, {poi.longitude?.toFixed(4)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => deletePoi(poi.id)} className="text-red-400 hover:text-red-600 text-xs transition-colors font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {filteredPois.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No POIs found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'areas' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">Areas & Event Zones</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{areas.length} total</span>
              </div>
              <Link href="/map" className="px-4 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors font-medium">+ Create on Map</Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.map(area => (
                <div key={area.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${area.color}15` }}>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: area.color }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{area.name}</div>
                      <div className="text-xs text-gray-400 capitalize">{area.area_type} &middot; {area.poi_count} POIs</div>
                    </div>
                  </div>
                  {area.description && <p className="text-xs text-gray-500 mb-3">{area.description}</p>}
                  {area.start_date && <div className="text-xs text-gray-400 mb-3">{new Date(area.start_date).toLocaleDateString()} &mdash; {area.end_date ? new Date(area.end_date).toLocaleDateString() : 'Ongoing'}</div>}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-300">{area.center_lat?.toFixed(4)}, {area.center_lng?.toFixed(4)}</span>
                    <button onClick={() => deleteArea(area.id)} className="text-red-400 hover:text-red-600 text-xs transition-colors font-medium">Delete</button>
                  </div>
                </div>
              ))}
              {areas.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No areas yet. Create one from the map.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
