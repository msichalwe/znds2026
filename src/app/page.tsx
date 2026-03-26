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
    <div className="min-h-screen bg-[#F5F6F8]">
      {/* ── Navigation ────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0F1629] flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <span className="text-[#0F1629] font-bold text-lg tracking-tight">ZNDS</span>
          </Link>
          <div className="hidden md:flex items-center gap-0">
            {[
              { href: '/map', label: 'MAP' },
              { href: '/api-docs', label: 'API' },
              { href: '/admin', label: 'ADMIN' },
            ].map(link => (
              <Link key={link.href} href={link.href} className="px-5 py-2 text-xs font-medium text-gray-500 hover:text-[#0F1629] tracking-[0.15em] uppercase transition-colors">
                {link.label}
              </Link>
            ))}
            <Link href="/map" className="ml-4 px-6 py-2.5 bg-[#0F1629] text-white text-xs font-medium tracking-[0.15em] uppercase hover:bg-[#1a2240] transition-colors flex items-center gap-3">
              OPEN MAP
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative pt-16 overflow-hidden">
        <div className="bg-[#0F1629] relative">
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
          {/* Accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

          <div className="relative max-w-[1400px] mx-auto px-8 py-24 md:py-40">
            <div className="max-w-4xl">
              <div className="text-emerald-400 text-xs font-medium tracking-[0.3em] uppercase mb-8">
                REPUBLIC OF ZAMBIA &mdash; NATIONAL DIGITAL INFRASTRUCTURE
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white uppercase leading-[0.95] tracking-[-0.03em] mb-8">
                BUILDING ZAMBIA&apos;S
                <br />
                <span className="text-emerald-400">DIGITAL ADDRESS</span>
                <br />
                INFRASTRUCTURE
              </h1>
              <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-12">
                A unique digital code for every location in Zambia. Generate addresses instantly from GPS coordinates across all 10 provinces.
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} className="max-w-2xl mb-12">
                <div className="flex items-stretch">
                  <div className="flex-1 flex items-center bg-white/10 border border-white/20 backdrop-blur-sm">
                    <div className="pl-5">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search digital address or location..."
                      className="flex-1 px-4 py-4 bg-transparent text-white placeholder-gray-500 focus:outline-none text-base"
                    />
                  </div>
                  <button type="submit" className="px-8 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium tracking-[0.15em] uppercase transition-colors flex items-center gap-2">
                    SEARCH
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                </div>
              </form>

              {/* Quick Links */}
              <div className="flex flex-wrap gap-4">
                {[
                  { href: '/map', label: 'Interactive Map', icon: '01' },
                  { href: '/api-docs', label: 'API Reference', icon: '02' },
                  { href: '/admin', label: 'Dashboard', icon: '03' },
                ].map(item => (
                  <Link key={item.href} href={item.href} className="group flex items-center gap-4 px-6 py-3 border border-white/10 hover:border-emerald-400/50 hover:bg-white/5 transition-all">
                    <span className="text-emerald-400 text-xs font-mono font-bold">{item.icon}</span>
                    <span className="text-white text-sm tracking-wide">{item.label}</span>
                    <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-400 transition-colors ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Mission ───────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-emerald-600 text-xs font-medium tracking-[0.3em] uppercase mb-6">OUR MISSION</div>
            <h2 className="text-3xl md:text-5xl font-bold text-[#0F1629] uppercase leading-[1] tracking-[-0.02em] mb-8">
              A DIGITAL ADDRESS FOR EVERY LOCATION IN ZAMBIA
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              The Zambia National Digital Addressing System assigns a unique, human-readable code to every point in the country. Built on GPS coordinates, each address is deterministic, permanent, and instantly verifiable &mdash; enabling navigation, delivery, emergency services, and commerce across all 10 provinces.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-8 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-emerald-600 text-xs font-medium tracking-[0.3em] uppercase mb-6">HOW IT WORKS</div>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0F1629] uppercase leading-[1] tracking-[-0.02em] mb-16 max-w-2xl">
            DIGITAL ADDRESS IN THREE STEPS
          </h2>

          <div className="grid md:grid-cols-3 gap-0 border-t border-gray-200">
            {[
              { step: '01', title: 'SELECT LOCATION', desc: 'Click anywhere on the map or enter GPS coordinates to pinpoint your location within Zambia.', accent: 'text-emerald-500' },
              { step: '02', title: 'GENERATE ADDRESS', desc: 'The system identifies the province, calculates the sector grid, and creates a unique 6-digit code from coordinates.', accent: 'text-blue-500' },
              { step: '03', title: 'USE & SHARE', desc: 'Copy your digital address, share it, look up any code, or navigate to it. Use it for deliveries, emergencies, and commerce.', accent: 'text-purple-500' },
            ].map((item, i) => (
              <div key={i} className={`py-10 pr-10 ${i < 2 ? 'md:border-r border-gray-200' : ''} ${i > 0 ? 'md:pl-10' : ''}`}>
                <div className={`text-sm font-mono font-bold ${item.accent} mb-6`}>{item.step}</div>
                <h3 className="text-lg font-bold text-[#0F1629] uppercase tracking-wide mb-4">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Address Format ────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-blue-500 text-xs font-medium tracking-[0.3em] uppercase mb-6">ADDRESS FORMAT</div>
              <h2 className="text-3xl md:text-5xl font-bold text-[#0F1629] uppercase leading-[1] tracking-[-0.02em] mb-8">
                UNDERSTANDING THE CODE
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-10">
                Every ZNDS digital address follows a standardized format: Province-Sector-UniqueID. The code is deterministic &mdash; the same coordinates always produce the same address.
              </p>

              <div className="space-y-0 border-t border-gray-200">
                {[
                  { code: 'LSA', label: 'Province Code', desc: '3-letter code identifying one of 10 provinces', color: 'text-emerald-500' },
                  { code: 'K28', label: 'Sector Code', desc: 'Grid sector derived from latitude and longitude', color: 'text-blue-500' },
                  { code: '870183', label: 'Location ID', desc: 'Last 3 digits of longitude + last 3 digits of latitude', color: 'text-purple-500' },
                ].map((item) => (
                  <div key={item.code} className="flex items-start gap-6 py-5 border-b border-gray-200">
                    <span className={`font-mono font-bold text-xl ${item.color} w-20 shrink-0`}>{item.code}</span>
                    <div>
                      <div className="text-sm font-bold text-[#0F1629] uppercase tracking-wide mb-1">{item.label}</div>
                      <div className="text-sm text-gray-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0F1629] p-12 md:p-16 relative">
              <div className="absolute top-0 left-0 w-4 h-4 bg-emerald-400" />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400" />
              <div className="text-center">
                <div className="text-xs text-gray-500 tracking-[0.3em] uppercase mb-6">EXAMPLE ADDRESS</div>
                <div className="text-4xl md:text-5xl font-mono font-bold tracking-[0.1em] mb-8">
                  <span className="text-emerald-400">LSA</span>
                  <span className="text-gray-600">-</span>
                  <span className="text-blue-400">K28</span>
                  <span className="text-gray-600">-</span>
                  <span className="text-purple-400">870183</span>
                </div>
                <div className="text-gray-500 text-sm">Lusaka Province &middot; Sector K28 &middot; Point 870183</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Province Coverage ─────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-8 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-emerald-600 text-xs font-medium tracking-[0.3em] uppercase mb-6">COVERAGE</div>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0F1629] uppercase leading-[1] tracking-[-0.02em] mb-16 max-w-xl">
            ALL 10 PROVINCES
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border-t border-l border-gray-200">
            {(stats?.provinceStats || [
              { code: 'LSA', name: 'Lusaka' }, { code: 'CPB', name: 'Copperbelt' },
              { code: 'CEN', name: 'Central' }, { code: 'SOU', name: 'Southern' },
              { code: 'EAS', name: 'Eastern' }, { code: 'NOR', name: 'Northern' },
              { code: 'MUG', name: 'Muchinga' }, { code: 'WES', name: 'Western' },
              { code: 'NWE', name: 'North-Western' }, { code: 'LUA', name: 'Luapula' },
            ].map(p => ({ ...p, address_count: '0', poi_count: '0' }))).map((p) => (
              <div key={p.code} className="border-r border-b border-gray-200 p-6 hover:bg-emerald-50 transition-colors group">
                <div className="text-xs font-mono text-emerald-600 font-bold mb-2">{p.code}</div>
                <div className="text-sm font-bold text-[#0F1629] uppercase tracking-wide mb-3">{p.name}</div>
                <div className="text-[11px] text-gray-400 space-y-0.5">
                  <div>{p.address_count} addresses</div>
                  <div>{p.poi_count} POIs</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      {stats && (
        <section className="py-24 px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-blue-500 text-xs font-medium tracking-[0.3em] uppercase mb-6">SYSTEM METRICS</div>
            <h2 className="text-3xl md:text-5xl font-bold text-[#0F1629] uppercase leading-[1] tracking-[-0.02em] mb-16 max-w-xl">
              BY THE NUMBERS
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l border-gray-200">
              {[
                { label: 'DIGITAL ADDRESSES', value: stats.totalAddresses.toLocaleString(), accent: 'text-emerald-500' },
                { label: 'POINTS OF INTEREST', value: stats.totalPois.toLocaleString(), accent: 'text-blue-500' },
                { label: 'ACTIVE AREAS', value: stats.totalAreas.toLocaleString(), accent: 'text-purple-500' },
                { label: 'TOTAL SEARCHES', value: stats.totalSearches.toLocaleString(), accent: 'text-amber-500' },
              ].map((s) => (
                <div key={s.label} className="border-r border-b border-gray-200 p-8">
                  <div className={`text-4xl md:text-5xl font-bold ${s.accent} mb-3`}>{s.value}</div>
                  <div className="text-[11px] text-gray-400 tracking-[0.2em] uppercase font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── API Preview ───────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-8 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="text-purple-500 text-xs font-medium tracking-[0.3em] uppercase mb-6">DEVELOPER API</div>
              <h2 className="text-3xl md:text-5xl font-bold text-[#0F1629] uppercase leading-[1] tracking-[-0.02em] mb-8">
                BUILD WITH OUR API
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-10">
                Integrate digital addressing into your applications with our REST API. Generate addresses, look up codes, search locations, and manage points of interest programmatically.
              </p>
              <Link href="/api-docs" className="inline-flex items-center gap-4 px-8 py-3.5 bg-[#0F1629] text-white text-xs font-medium tracking-[0.15em] uppercase hover:bg-[#1a2240] transition-colors">
                VIEW API DOCUMENTATION
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>

            <div className="bg-[#0F1629] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 bg-[#0a0e1a] border-b border-white/5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                <span className="text-[11px] text-gray-500 ml-3 font-mono tracking-wider uppercase">API Examples</span>
              </div>
              <pre className="p-6 text-[13px] font-mono overflow-x-auto leading-relaxed"><code className="text-gray-400">{`# Generate digital address
`}<span className="text-emerald-400">GET</span>{` /api/postcode?lat=-15.4183&lng=28.287

# Look up a digital address
`}<span className="text-emerald-400">GET</span>{` /api/address/lookup?address=LSA-K28-870183

# Search locations & POIs
`}<span className="text-emerald-400">GET</span>{` /api/search?q=Lusaka

# Create a point of interest
`}<span className="text-blue-400">POST</span>{` /api/pois
`}<span className="text-gray-500">{`{ "name": "UTH", "lat": -15.40, "lng": 28.31 }`}</span></code></pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="bg-[#0F1629] py-20 px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 mb-16">
            {/* Left */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white uppercase leading-[1] tracking-[-0.02em] mb-10">
                EXPLORE ZNDS
              </h3>
              <div className="space-y-0 border-t border-white/10">
                {[
                  { num: '01', label: 'Home', href: '/' },
                  { num: '02', label: 'Interactive Map', href: '/map' },
                  { num: '03', label: 'API Documentation', href: '/api-docs' },
                  { num: '04', label: 'Admin Dashboard', href: '/admin' },
                ].map(link => (
                  <Link key={link.href} href={link.href} className="flex items-center gap-4 py-4 border-b border-white/10 group hover:border-emerald-400/30 transition-colors">
                    <span className="text-emerald-400 text-xs font-mono font-bold">{link.num}</span>
                    <span className="text-white text-sm tracking-wide group-hover:pl-2 transition-all">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white uppercase leading-[1] tracking-[-0.02em] mb-10">
                ZAMBIA NATIONAL DIGITAL ADDRESSING SYSTEM
              </h3>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-md">
                A comprehensive digital infrastructure for location identification, navigation, and service delivery across the Republic of Zambia.
              </p>
              <Link href="/map" className="inline-flex items-center gap-4 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium tracking-[0.15em] uppercase transition-colors">
                GET STARTED
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-emerald-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              </div>
              <span className="text-gray-500 text-xs tracking-[0.1em] uppercase">ZNDS</span>
            </div>
            <div className="text-gray-600 text-[11px] tracking-[0.1em] uppercase">
              Powered by ZICTA &middot; Republic of Zambia &middot; {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
