'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  totalAddresses: number;
  totalPois: number;
  totalAreas: number;
  totalSearches: number;
  provinceStats: Array<{ code: string; name: string; address_count: string; poi_count: string }>;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/map?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-lg leading-tight">ZNDS</h1>
              <p className="text-emerald-600 text-[10px] uppercase tracking-widest font-medium">Zambia National Digital Addressing System</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <Link href="/map" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">Map</Link>
            <Link href="/api-docs" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">API</Link>
            <Link href="/admin" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">Admin</Link>
            <Link href="/map" className="ml-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg transition-all shadow-lg shadow-emerald-200">Open Map</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-100 rounded-full blur-[100px] opacity-50" />
          <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-amber-100 rounded-full blur-[100px] opacity-40" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_0)] bg-[size:32px_32px]" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Republic of Zambia &mdash; National Digital Infrastructure
          </div>

          <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
            Every Location.
            <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">One Digital Address.</span>
          </h2>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            A unique digital code for every point in Zambia. Click any location on the map to generate its address instantly. Search, navigate, and manage POIs across all 10 provinces.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-16">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl shadow-gray-100/50">
                <div className="pl-5">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search digital address (LSA-K28-870183) or location..." className="flex-1 px-4 py-4 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-base" />
                <button type="submit" className="px-6 py-2.5 m-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-xl transition-all text-sm shadow-lg shadow-emerald-200">Search</button>
              </div>
            </div>
          </form>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { href: '/map', title: 'Interactive Map', desc: 'Click to generate addresses', gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /> },
              { href: '/api-docs', title: 'API Access', desc: 'Integrate with your apps', gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50', text: 'text-blue-700', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /> },
              { href: '/admin', title: 'Manage POIs', desc: 'Areas, events & locations', gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-50', text: 'text-purple-700', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /> },
            ].map((a) => (
              <Link key={a.href} href={a.href} className={`group flex items-center gap-3 px-6 py-3.5 bg-white hover:shadow-lg border border-gray-100 hover:border-gray-200 rounded-xl transition-all shadow-sm`}>
                <div className={`w-10 h-10 rounded-lg ${a.bg} flex items-center justify-center`}>
                  <svg className={`w-5 h-5 ${a.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{a.icon}</svg>
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">{a.title}</div>
                  <div className="text-xs text-gray-400">{a.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 px-6 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-600 text-sm font-semibold uppercase tracking-widest mb-3">How It Works</p>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Digital Address in Three Steps</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Select Location', desc: 'Click anywhere on the map or enter GPS coordinates to pinpoint your location.', color: 'emerald', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /> },
              { step: '02', title: 'Generate Address', desc: 'The system identifies the province, sector, and creates a unique code from GPS coordinates.', color: 'blue', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
              { step: '03', title: 'Use & Share', desc: 'Copy, share, or look up any digital address. Add POIs and create event zones.', color: 'purple', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /> },
            ].map((item, i) => {
              const bgColors = { emerald: 'bg-emerald-50', blue: 'bg-blue-50', purple: 'bg-purple-50' };
              const textColors = { emerald: 'text-emerald-600', blue: 'text-blue-600', purple: 'text-purple-600' };
              const borderColors = { emerald: 'border-emerald-100', blue: 'border-blue-100', purple: 'border-purple-100' };
              return (
                <div key={i} className="group relative">
                  <div className={`bg-white border ${borderColors[item.color as keyof typeof borderColors]} rounded-2xl p-8 hover:shadow-xl hover:shadow-gray-100/50 transition-all`}>
                    <div className="text-6xl font-black text-gray-50 absolute top-4 right-6">{item.step}</div>
                    <div className={`w-14 h-14 rounded-xl ${bgColors[item.color as keyof typeof bgColors]} flex items-center justify-center ${textColors[item.color as keyof typeof textColors]} mb-6`}>
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h4>
                    <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Address Format */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-emerald-600 text-sm font-semibold uppercase tracking-widest mb-3">Address Format</p>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Understanding the Code</h3>
          </div>
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 rounded-3xl blur opacity-30" />
            <div className="relative bg-white border border-gray-100 rounded-3xl p-10 shadow-xl">
              <div className="flex items-center justify-center mb-10">
                <div className="text-5xl md:text-6xl font-mono font-bold tracking-wider">
                  <span className="text-emerald-500">LSA</span><span className="text-gray-200 mx-1">-</span>
                  <span className="text-blue-500">K28</span><span className="text-gray-200 mx-1">-</span>
                  <span className="text-purple-500">870183</span>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { code: 'LSA', label: 'Province Code', desc: 'Identifies the province (Lusaka)', color: 'emerald' },
                  { code: 'K28', label: 'Sector Code', desc: 'Grid sector from GPS coordinates', color: 'blue' },
                  { code: '870183', label: 'Location ID', desc: 'Last 3 digits of longitude + last 3 of latitude', color: 'purple' },
                ].map((c) => {
                  const bg = { emerald: 'bg-emerald-50 border-emerald-100', blue: 'bg-blue-50 border-blue-100', purple: 'bg-purple-50 border-purple-100' };
                  const text = { emerald: 'text-emerald-600', blue: 'text-blue-600', purple: 'text-purple-600' };
                  return (
                    <div key={c.code} className={`text-center p-5 ${bg[c.color as keyof typeof bg]} border rounded-xl`}>
                      <div className={`text-2xl font-mono font-bold ${text[c.color as keyof typeof text]} mb-2`}>{c.code}</div>
                      <div className="text-sm font-medium text-gray-800 mb-1">{c.label}</div>
                      <div className="text-xs text-gray-500">{c.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Province Coverage */}
      <section className="relative py-24 px-6 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-emerald-600 text-sm font-semibold uppercase tracking-widest mb-3">Coverage</p>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">All 10 Provinces</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(stats?.provinceStats || [
              { code: 'LSA', name: 'Lusaka' }, { code: 'CPB', name: 'Copperbelt' },
              { code: 'CEN', name: 'Central' }, { code: 'SOU', name: 'Southern' },
              { code: 'EAS', name: 'Eastern' }, { code: 'NOR', name: 'Northern' },
              { code: 'MUG', name: 'Muchinga' }, { code: 'WES', name: 'Western' },
              { code: 'NWE', name: 'North-Western' }, { code: 'LUA', name: 'Luapula' },
            ].map(p => ({ ...p, address_count: '0', poi_count: '0' }))).map((p) => (
              <div key={p.code} className="bg-white border border-gray-100 rounded-xl p-4 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all cursor-pointer">
                <div className="text-xs font-mono text-emerald-600 font-bold mb-1">{p.code}</div>
                <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                <div className="text-[10px] text-gray-400 mt-1">{p.address_count} addresses &middot; {p.poi_count} POIs</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="relative py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Digital Addresses', value: stats.totalAddresses.toLocaleString(), color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                { label: 'Points of Interest', value: stats.totalPois.toLocaleString(), color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                { label: 'Active Areas', value: stats.totalAreas.toLocaleString(), color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                { label: 'Searches', value: stats.totalSearches.toLocaleString(), color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
              ].map((s) => (
                <div key={s.label} className={`text-center p-6 ${s.bg} border ${s.border} rounded-xl`}>
                  <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* API Preview */}
      <section className="relative py-24 px-6 bg-gray-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-emerald-600 text-sm font-semibold uppercase tracking-widest mb-3">Developer API</p>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Build With Our API</h3>
            <p className="text-gray-500 max-w-xl mx-auto">Integrate digital addressing into your applications with our REST API.</p>
          </div>
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl blur opacity-30" />
            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs text-gray-400 ml-2 font-mono">API Examples</span>
              </div>
              <pre className="p-6 text-sm font-mono overflow-x-auto"><code className="text-gray-300">{`# Generate digital address from coordinates
GET /api/postcode?lat=-15.4183&lng=28.2870

# Look up a digital address
GET /api/address/lookup?address=LSA-K28-870183

# Reverse geocode with nearby POIs
GET /api/address/reverse?lat=-15.4183&lng=28.2870&radius=5

# Search by name or digital address
GET /api/search?q=Lusaka

# List & create POIs
GET /api/pois?category=hospital&province=LSA
POST /api/pois  { "name": "UTH", "latitude": -15.40, "longitude": 28.31 }

# Create event area (e.g. Trade Fair)
POST /api/areas  { "name": "Trade Fair 2026", "area_type": "event", ... }`}</code></pre>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/api-docs" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-emerald-600 border border-emerald-200 hover:bg-emerald-50 rounded-xl transition-all">
              View Full API Documentation
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
            </div>
            <span className="text-gray-500 text-sm">Zambia Digital Addressing System</span>
          </div>
          <div className="text-gray-400 text-xs">Powered by ZICTA &middot; Republic of Zambia &middot; {new Date().getFullYear()}</div>
        </div>
      </footer>
    </div>
  );
}
