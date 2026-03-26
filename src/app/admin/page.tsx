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
    <div className="min-h-screen bg-[#F5F6F8]">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#0F1629] flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              </div>
              <span className="text-[#0F1629] font-bold text-lg tracking-tight">ZNDS</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-400 text-xs tracking-[0.15em] uppercase">Admin</span>
          </div>
          <div className="hidden md:flex items-center gap-0">
            <Link href="/map" className="px-5 py-2 text-xs font-medium text-gray-500 hover:text-[#0F1629] tracking-[0.15em] uppercase transition-colors">MAP</Link>
            <Link href="/api-docs" className="px-5 py-2 text-xs font-medium text-gray-500 hover:text-[#0F1629] tracking-[0.15em] uppercase transition-colors">API</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-[#0F1629] py-12 px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-emerald-400 text-xs font-medium tracking-[0.3em] uppercase mb-4">MANAGEMENT</div>
          <h1 className="text-3xl md:text-4xl font-bold text-white uppercase leading-[1] tracking-[-0.02em]">ADMIN DASHBOARD</h1>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 pt-8">
        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-8">
          {(['dashboard', 'pois', 'areas'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] border-b-2 transition-all ${tab === t ? 'border-emerald-500 text-[#0F1629]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {t === 'pois' ? 'Points of Interest' : t}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && stats && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l border-gray-200">
              {[
                { label: 'DIGITAL ADDRESSES', value: stats.totalAddresses, accent: 'text-emerald-500' },
                { label: 'POINTS OF INTEREST', value: stats.totalPois, accent: 'text-blue-500' },
                { label: 'ACTIVE AREAS', value: stats.totalAreas, accent: 'text-purple-500' },
                { label: 'TOTAL SEARCHES', value: stats.totalSearches, accent: 'text-amber-500' },
              ].map(s => (
                <div key={s.label} className="bg-white border-r border-b border-gray-200 p-6">
                  <div className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-bold mb-3">{s.label}</div>
                  <div className={`text-3xl font-bold ${s.accent}`}>{s.value.toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Province Coverage */}
              <div className="bg-white border border-gray-200 p-6">
                <h3 className="text-xs font-bold text-[#0F1629] uppercase tracking-[0.15em] mb-6">Province Coverage</h3>
                <div className="space-y-0 border-t border-gray-100">
                  {stats.provinceStats.map(p => (
                    <div key={p.code} className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-emerald-600 font-bold w-8">{p.code}</span>
                        <span className="text-sm text-gray-700">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-gray-400 tracking-wide">
                        <span>{p.address_count} addr</span>
                        <span>{p.poi_count} POIs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {/* POI Categories */}
                <div className="bg-white border border-gray-200 p-6">
                  <h3 className="text-xs font-bold text-[#0F1629] uppercase tracking-[0.15em] mb-6">POI Categories</h3>
                  {stats.categoryStats.length === 0 ? <p className="text-gray-400 text-sm">No POIs yet</p> : (
                    <div className="space-y-0 border-t border-gray-100">
                      {stats.categoryStats.map(c => (
                        <div key={c.category} className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-sm text-gray-600 capitalize">{c.category}</span>
                          <span className="text-sm font-mono text-gray-400 font-bold">{c.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Searches */}
                <div className="bg-white border border-gray-200 p-6">
                  <h3 className="text-xs font-bold text-[#0F1629] uppercase tracking-[0.15em] mb-6">Recent Searches</h3>
                  {stats.recentSearches.length === 0 ? <p className="text-gray-400 text-sm">No searches yet</p> : (
                    <div className="space-y-0 border-t border-gray-100">
                      {stats.recentSearches.slice(0, 8).map((s, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100">
                          <span className="text-sm text-gray-600 truncate max-w-[200px]">{s.query}</span>
                          <span className="text-[11px] text-gray-300 font-mono">{s.result_count} results</span>
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
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-bold text-[#0F1629] uppercase tracking-[0.15em]">Points of Interest</h2>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 font-mono font-bold">{filteredPois.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <select value={poiFilter} onChange={e => setPoiFilter(e.target.value)} className="px-4 py-2 bg-white border border-gray-200 text-xs text-gray-600 focus:outline-none tracking-wide uppercase">
                  <option value="">All categories</option>
                  {['general','hospital','school','bank','restaurant','hotel','government','church','market','event','transport','park'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Link href="/map" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium tracking-[0.15em] uppercase transition-colors">+ ADD ON MAP</Link>
              </div>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#F5F6F8]">
                    <th className="text-left px-5 py-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Name</th>
                    <th className="text-left px-5 py-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Category</th>
                    <th className="text-left px-5 py-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Digital Code</th>
                    <th className="text-left px-5 py-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Province</th>
                    <th className="text-left px-5 py-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Coordinates</th>
                    <th className="text-right px-5 py-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPois.map(poi => (
                    <tr key={poi.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-[#0F1629] font-medium">{poi.name}</td>
                      <td className="px-5 py-3.5 text-gray-500 capitalize">{poi.category}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-emerald-600 font-bold">{poi.digital_code}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs font-mono">{poi.province_code}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs font-mono">{poi.latitude?.toFixed(4)}, {poi.longitude?.toFixed(4)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => deletePoi(poi.id)} className="text-red-400 hover:text-red-600 text-[10px] transition-colors font-bold uppercase tracking-wider">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {filteredPois.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No POIs found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'areas' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-bold text-[#0F1629] uppercase tracking-[0.15em]">Areas & Event Zones</h2>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 font-mono font-bold">{areas.length}</span>
              </div>
              <Link href="/map" className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium tracking-[0.15em] uppercase transition-colors">+ CREATE ON MAP</Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.map(area => (
                <div key={area.id} className="bg-white border border-gray-200 p-6 hover:border-gray-300 transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: `${area.color}15` }}>
                      <div className="w-4 h-4" style={{ backgroundColor: area.color }} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0F1629]">{area.name}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">{area.area_type} &middot; {area.poi_count} POIs</div>
                    </div>
                  </div>
                  {area.description && <p className="text-xs text-gray-500 mb-3">{area.description}</p>}
                  {area.start_date && <div className="text-[11px] text-gray-400 mb-4">{new Date(area.start_date).toLocaleDateString()} &mdash; {area.end_date ? new Date(area.end_date).toLocaleDateString() : 'Ongoing'}</div>}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-[11px] text-gray-300 font-mono">{area.center_lat?.toFixed(4)}, {area.center_lng?.toFixed(4)}</span>
                    <button onClick={() => deleteArea(area.id)} className="text-red-400 hover:text-red-600 text-[10px] transition-colors font-bold uppercase tracking-wider">Delete</button>
                  </div>
                </div>
              ))}
              {areas.length === 0 && <div className="col-span-full text-center py-16 text-gray-400">No areas yet. Create one from the map.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
