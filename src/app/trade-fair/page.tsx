'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stand {
  id: string;
  name: string;
  company: string;
  category: string;
  description: string;
  digitalAddress: string;
  position: { row: number; col: number; width: number; height: number };
  color: string;
  image: string;
  contact: string;
  products: string[];
}

const STANDS: Stand[] = [
  {
    id: 'A1', name: 'Stand A1', company: 'Zambia Copper Mining Corp', category: 'Mining & Resources',
    description: 'Leading copper and cobalt mining operations across the Copperbelt province. Showcasing sustainable extraction technologies and community development programs.',
    digitalAddress: 'LSA-K28-184370', position: { row: 0, col: 0, width: 2, height: 2 }, color: '#10b981',
    image: '/api/placeholder/mining', contact: 'info@zcmc.co.zm', products: ['Copper Cathodes', 'Cobalt Concentrate', 'Mining Equipment'],
  },
  {
    id: 'A2', name: 'Stand A2', company: 'AgriZam Solutions', category: 'Agriculture',
    description: 'Smart farming solutions for Zambian agriculture. IoT-enabled crop monitoring, precision irrigation systems, and digital marketplace for farmers.',
    digitalAddress: 'LSA-K28-185371', position: { row: 0, col: 2, width: 1, height: 2 }, color: '#22c55e',
    image: '/api/placeholder/agri', contact: 'hello@agrizamsolutions.zm', products: ['Smart Sensors', 'Irrigation Systems', 'Farm Analytics'],
  },
  {
    id: 'A3', name: 'Stand A3', company: 'Lusaka FinTech Hub', category: 'Financial Technology',
    description: 'Digital payment solutions and mobile banking platforms connecting rural communities to the formal financial system.',
    digitalAddress: 'LSA-K28-186372', position: { row: 0, col: 3, width: 1, height: 1 }, color: '#3b82f6',
    image: '/api/placeholder/fintech', contact: 'info@lusakafintech.zm', products: ['Mobile Money', 'Digital Lending', 'Payment Gateway'],
  },
  {
    id: 'B1', name: 'Stand B1', company: 'ZamPower Energy', category: 'Energy & Utilities',
    description: 'Renewable energy solutions including solar farms, micro-hydro installations, and off-grid power systems for rural electrification.',
    digitalAddress: 'LSA-K28-187373', position: { row: 2, col: 0, width: 1, height: 2 }, color: '#f59e0b',
    image: '/api/placeholder/energy', contact: 'power@zampower.co.zm', products: ['Solar Panels', 'Battery Storage', 'Mini-Grid Systems'],
  },
  {
    id: 'B2', name: 'Stand B2', company: 'Digital Zambia Initiative', category: 'Technology',
    description: 'Government-backed digital transformation program. Showcasing e-government services, digital ID systems, and the ZNDS platform.',
    digitalAddress: 'LSA-K28-188374', position: { row: 2, col: 1, width: 2, height: 1 }, color: '#8b5cf6',
    image: '/api/placeholder/digital', contact: 'info@digitalzambia.gov.zm', products: ['ZNDS Platform', 'Digital ID', 'E-Government Portal'],
  },
  {
    id: 'B3', name: 'Stand B3', company: 'SafariTech Tours', category: 'Tourism & Hospitality',
    description: 'Luxury safari experiences and eco-tourism packages. Virtual reality previews of Victoria Falls, South Luangwa, and Kafue National Park.',
    digitalAddress: 'LSA-K28-189375', position: { row: 2, col: 3, width: 1, height: 1 }, color: '#ec4899',
    image: '/api/placeholder/tourism', contact: 'book@safaritechzm.com', products: ['Safari Packages', 'VR Tours', 'Eco-Lodges'],
  },
  {
    id: 'C1', name: 'Stand C1', company: 'ZamHealth Medical', category: 'Healthcare',
    description: 'Telemedicine solutions connecting rural clinics to specialist doctors. AI-powered diagnostics and medical supply chain management.',
    digitalAddress: 'LSA-K28-190376', position: { row: 3, col: 1, width: 1, height: 1 }, color: '#ef4444',
    image: '/api/placeholder/health', contact: 'care@zamhealth.co.zm', products: ['Telemedicine Kit', 'AI Diagnostics', 'Supply Chain Platform'],
  },
  {
    id: 'C2', name: 'Stand C2', company: 'EduConnect Zambia', category: 'Education',
    description: 'E-learning platforms and digital classrooms for Zambian schools. Offline-capable content delivery and teacher training programs.',
    digitalAddress: 'LSA-K28-191377', position: { row: 3, col: 2, width: 2, height: 1 }, color: '#0ea5e9',
    image: '/api/placeholder/education', contact: 'learn@educonnectzm.org', products: ['E-Learning Platform', 'Digital Textbooks', 'Teacher Portal'],
  },
  {
    id: 'D1', name: 'Stand D1', company: 'ZamBuild Construction', category: 'Construction',
    description: 'Modern construction materials and prefabricated building solutions. Affordable housing technology for urban and peri-urban development.',
    digitalAddress: 'LSA-K28-192378', position: { row: 4, col: 0, width: 2, height: 1 }, color: '#78716c',
    image: '/api/placeholder/construction', contact: 'build@zambuild.co.zm', products: ['Prefab Houses', 'Smart Cement', 'Green Materials'],
  },
  {
    id: 'D2', name: 'Stand D2', company: 'Zambezi Logistics', category: 'Transport & Logistics',
    description: 'End-to-end logistics and last-mile delivery solutions powered by ZNDS digital addressing for precise location tracking.',
    digitalAddress: 'LSA-K28-193379', position: { row: 4, col: 2, width: 1, height: 1 }, color: '#6366f1',
    image: '/api/placeholder/logistics', contact: 'ship@zambezilogistics.zm', products: ['Fleet Management', 'Last-Mile Delivery', 'Warehouse Solutions'],
  },
  {
    id: 'D3', name: 'Stand D3', company: 'Mansa TextileWorks', category: 'Manufacturing',
    description: 'Premium textile manufacturing using locally sourced cotton. Traditional Zambian patterns meet modern fashion design.',
    digitalAddress: 'LUA-M15-194380', position: { row: 4, col: 3, width: 1, height: 1 }, color: '#d946ef',
    image: '/api/placeholder/textiles', contact: 'sales@mansatextiles.zm', products: ['Chitenge Fabrics', 'Fashion Line', 'Home Textiles'],
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  'Mining & Resources': 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  'Agriculture': 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064',
  'Financial Technology': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'Energy & Utilities': 'M13 10V3L4 14h7v7l9-11h-7z',
  'Technology': 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  'Tourism & Hospitality': 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064',
  'Healthcare': 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  'Education': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  'Construction': 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  'Transport & Logistics': 'M8 7h12l2 5h-2v4a1 1 0 01-1 1h-1a2 2 0 11-4 0H9a2 2 0 11-4 0H4a1 1 0 01-1-1v-4l2-5h3zm0 0V4a1 1 0 011-1h4a1 1 0 011 1v3',
  'Manufacturing': 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
};

export default function TradeFairPage() {
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const [viewMode, setViewMode] = useState<'floor' | 'list'>('floor');
  const [filterCategory, setFilterCategory] = useState('');
  const [userPos, setUserPos] = useState({ x: 50, y: 15 });
  const [isAnimating, setIsAnimating] = useState(true);

  // Animate user icon moving between stands
  useEffect(() => {
    if (!isAnimating) return;
    const positions = [
      { x: 50, y: 15 }, { x: 150, y: 15 }, { x: 250, y: 15 },
      { x: 250, y: 115 }, { x: 150, y: 115 }, { x: 50, y: 115 },
      { x: 50, y: 215 }, { x: 150, y: 215 }, { x: 250, y: 215 },
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % positions.length;
      setUserPos(positions[i]);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAnimating]);

  const categories = [...new Set(STANDS.map(s => s.category))];
  const filtered = filterCategory ? STANDS.filter(s => s.category === filterCategory) : STANDS;

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#0F1629] flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              </div>
              <span className="text-[#0F1629] font-bold text-lg tracking-tight">ZNDS</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-400 text-xs tracking-[0.15em] uppercase">Trade Fair</span>
          </div>
          <div className="hidden md:flex items-center gap-0">
            <Link href="/" className="px-5 py-2 text-xs font-medium text-gray-500 hover:text-[#0F1629] tracking-[0.15em] uppercase transition-colors">HOME</Link>
            <Link href="/map" className="px-5 py-2 text-xs font-medium text-gray-500 hover:text-[#0F1629] tracking-[0.15em] uppercase transition-colors">MAP</Link>
            <Link href="/api-docs" className="px-5 py-2 text-xs font-medium text-gray-500 hover:text-[#0F1629] tracking-[0.15em] uppercase transition-colors">API</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-[#0F1629] pt-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
        <div className="relative max-w-[1400px] mx-auto px-8 py-16 md:py-24">
          <div className="text-emerald-400 text-xs font-medium tracking-[0.3em] uppercase mb-4">ZAMBIA INTERNATIONAL TRADE FAIR 2026</div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white uppercase leading-[0.95] tracking-[-0.03em] mb-6">
            LUSAKA EXHIBITION
            <br />
            <span className="text-emerald-400">& TRADE FAIR</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl leading-relaxed mb-8">
            Explore exhibition stands from Zambia&apos;s leading companies and innovators. Each stand is digitally addressed using the ZNDS platform for precise navigation.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              15-22 July 2026
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Lusaka Showgrounds
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              {STANDS.length} Exhibitors
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-10">
        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex gap-0 border border-gray-200">
              <button onClick={() => setViewMode('floor')} className={`px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all ${viewMode === 'floor' ? 'bg-[#0F1629] text-white' : 'bg-white text-gray-500 hover:text-[#0F1629]'}`}>
                FLOOR PLAN
              </button>
              <button onClick={() => setViewMode('list')} className={`px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all ${viewMode === 'list' ? 'bg-[#0F1629] text-white' : 'bg-white text-gray-500 hover:text-[#0F1629]'}`}>
                LIST VIEW
              </button>
            </div>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 text-xs text-gray-600 focus:outline-none tracking-wide uppercase">
              <option value="">All categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] text-gray-400 tracking-wider uppercase">
            <span className="w-3 h-3 bg-emerald-500 inline-block" />
            ZNDS Addressed Stands
          </div>
        </div>

        {/* Floor Plan View */}
        {viewMode === 'floor' && (
          <div className="mb-12">
            <div className="bg-white border border-gray-200 p-8 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-[#0F1629] uppercase tracking-[0.15em]">Exhibition Hall — Top-Down Floor Plan</h3>
                <button onClick={() => setIsAnimating(!isAnimating)} className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-gray-200 hover:border-emerald-500 text-gray-500 hover:text-emerald-600 transition-colors">
                  {isAnimating ? 'PAUSE' : 'ANIMATE'} VISITOR
                </button>
              </div>

              {/* 3D Perspective Floor Plan */}
              <div className="relative" style={{ perspective: '1200px' }}>
                <div className="relative" style={{ transform: 'rotateX(25deg) rotateZ(-2deg)', transformOrigin: 'center center' }}>
                  {/* Floor grid background */}
                  <div className="relative bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 p-8" style={{ minHeight: '500px' }}>
                    {/* Grid lines */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

                    {/* Hall labels */}
                    <div className="absolute top-2 left-4 text-[10px] text-gray-300 tracking-[0.3em] uppercase font-bold">ENTRANCE</div>
                    <div className="absolute bottom-2 right-4 text-[10px] text-gray-300 tracking-[0.3em] uppercase font-bold">EXIT</div>
                    <div className="absolute top-2 right-4 text-[10px] text-gray-300 tracking-[0.3em] uppercase font-bold">HALL A</div>

                    {/* Aisles */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-12 -translate-x-1/2 bg-white/50 border-x border-dashed border-gray-200" />

                    {/* Stands Grid */}
                    <div className="relative grid grid-cols-4 gap-4 p-4">
                      {filtered.map((stand, idx) => (
                        <div
                          key={stand.id}
                          className="stand-appear trade-fair-stand cursor-pointer"
                          style={{ animationDelay: `${idx * 0.1}s`, gridColumn: `span ${stand.position.width}`, gridRow: `span ${stand.position.height}` }}
                          onClick={() => setSelectedStand(stand)}
                        >
                          <div className="bg-white border-2 border-gray-200 hover:border-emerald-400 p-4 h-full transition-all relative overflow-hidden group">
                            {/* Color accent bar */}
                            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: stand.color }} />

                            {/* Stand image placeholder */}
                            <div className="w-full h-24 mb-3 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: `${stand.color}08` }}>
                              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${stand.color} 0, ${stand.color} 1px, transparent 0, transparent 50%)`, backgroundSize: '10px 10px' }} />
                              <svg className="w-10 h-10" style={{ color: `${stand.color}40` }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={CATEGORY_ICONS[stand.category] || 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5'} />
                              </svg>
                            </div>

                            <div className="text-[10px] font-mono font-bold tracking-wider mb-1" style={{ color: stand.color }}>{stand.id}</div>
                            <div className="text-sm font-bold text-[#0F1629] mb-1 truncate">{stand.company}</div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">{stand.category}</div>
                            <div className="flex items-center gap-1.5 mt-auto">
                              <div className="w-1.5 h-1.5 bg-emerald-500" />
                              <span className="text-[10px] font-mono text-emerald-600 font-bold">{stand.digitalAddress}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Animated User Icon */}
                    <div
                      className="absolute floor-plan-user z-10 pointer-events-none"
                      style={{
                        left: `${userPos.x + 60}px`,
                        top: `${userPos.y + 60}px`,
                        transition: 'left 2s ease-in-out, top 2s ease-in-out',
                      }}
                    >
                      <div className="relative">
                        <div className="w-8 h-8 bg-[#0F1629] flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#0F1629]" />
                        <div className="absolute -inset-2 border-2 border-emerald-400/30 animate-ping" style={{ animationDuration: '2s' }} />
                      </div>
                      <div className="mt-1 text-[8px] font-mono font-bold text-[#0F1629] bg-white px-1.5 py-0.5 shadow-sm text-center tracking-wider">VISITOR</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-gray-200 mb-12">
            {filtered.map((stand, idx) => (
              <div
                key={stand.id}
                className="stand-appear trade-fair-stand bg-white border-r border-b border-gray-200 cursor-pointer"
                style={{ animationDelay: `${idx * 0.08}s` }}
                onClick={() => setSelectedStand(stand)}
              >
                <div className="p-6 h-full">
                  {/* Header with color accent */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 flex items-center justify-center" style={{ backgroundColor: `${stand.color}10` }}>
                      <svg className="w-6 h-6" style={{ color: stand.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={CATEGORY_ICONS[stand.category] || 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16'} />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-bold tracking-wider" style={{ color: stand.color }}>{stand.id}</div>
                      <div className="text-sm font-bold text-[#0F1629]">{stand.company}</div>
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-3">{stand.category}</div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{stand.description}</p>

                  {/* Products */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {stand.products.map(p => (
                      <span key={p} className="px-2 py-0.5 bg-gray-100 text-[10px] text-gray-500 uppercase tracking-wider">{p}</span>
                    ))}
                  </div>

                  {/* Digital Address */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500" />
                      <span className="text-xs font-mono text-emerald-600 font-bold">{stand.digitalAddress}</span>
                    </div>
                    <Link href={`/map?q=${stand.digitalAddress}`} className="text-[10px] text-gray-400 hover:text-emerald-600 uppercase tracking-wider font-bold transition-colors">
                      VIEW ON MAP
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stand Detail Modal */}
        {selectedStand && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" onClick={() => setSelectedStand(null)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="relative h-48 flex items-center justify-center" style={{ backgroundColor: `${selectedStand.color}08` }}>
                <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: selectedStand.color }} />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${selectedStand.color} 0, ${selectedStand.color} 1px, transparent 0, transparent 50%)`, backgroundSize: '15px 15px' }} />
                <svg className="w-20 h-20" style={{ color: `${selectedStand.color}25` }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={CATEGORY_ICONS[selectedStand.category] || 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16'} />
                </svg>
                <button onClick={() => setSelectedStand(null)} className="absolute top-4 right-4 w-8 h-8 bg-white border border-gray-200 flex items-center justify-center hover:border-gray-400 transition-colors">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono font-bold tracking-wider" style={{ color: selectedStand.color }}>{selectedStand.id}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">{selectedStand.category}</span>
                </div>
                <h2 className="text-2xl font-bold text-[#0F1629] uppercase tracking-tight mb-4">{selectedStand.company}</h2>
                <p className="text-gray-500 leading-relaxed mb-6">{selectedStand.description}</p>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-0 border-t border-l border-gray-200 mb-6">
                  <div className="border-r border-b border-gray-200 p-4">
                    <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-1">DIGITAL ADDRESS</div>
                    <div className="text-sm font-mono text-emerald-600 font-bold">{selectedStand.digitalAddress}</div>
                  </div>
                  <div className="border-r border-b border-gray-200 p-4">
                    <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-1">CONTACT</div>
                    <div className="text-sm text-gray-600">{selectedStand.contact}</div>
                  </div>
                  <div className="border-r border-b border-gray-200 p-4">
                    <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-1">STAND</div>
                    <div className="text-sm text-gray-600">{selectedStand.name}</div>
                  </div>
                  <div className="border-r border-b border-gray-200 p-4">
                    <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-1">CATEGORY</div>
                    <div className="text-sm text-gray-600">{selectedStand.category}</div>
                  </div>
                </div>

                {/* Products */}
                <div className="mb-6">
                  <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-3">PRODUCTS & SERVICES</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedStand.products.map(p => (
                      <span key={p} className="px-3 py-1.5 border border-gray-200 text-xs text-gray-600 uppercase tracking-wider">{p}</span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link href={`/map?q=${selectedStand.digitalAddress}`} className="flex-1 px-6 py-3 bg-[#0F1629] text-white text-xs font-medium tracking-[0.15em] uppercase hover:bg-[#1a2240] transition-colors text-center flex items-center justify-center gap-2">
                    VIEW ON MAP
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                  <button onClick={() => { navigator.clipboard.writeText(selectedStand.digitalAddress); }} className="px-6 py-3 border border-gray-200 text-gray-600 text-xs font-medium tracking-[0.15em] uppercase hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                    COPY ADDRESS
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l border-gray-200 mb-12">
          {[
            { label: 'EXHIBITORS', value: STANDS.length.toString(), accent: 'text-emerald-500' },
            { label: 'CATEGORIES', value: categories.length.toString(), accent: 'text-blue-500' },
            { label: 'FAIR DATES', value: '15-22 JUL', accent: 'text-purple-500' },
            { label: 'VENUE', value: 'LUSAKA', accent: 'text-amber-500' },
          ].map(s => (
            <div key={s.label} className="bg-white border-r border-b border-gray-200 p-6">
              <div className={`text-3xl font-bold ${s.accent} mb-2`}>{s.value}</div>
              <div className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-bold">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Categories Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-emerald-500" />
            <h2 className="text-sm font-bold text-[#0F1629] uppercase tracking-[0.15em]">Categories</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-0 border-t border-l border-gray-200">
            {categories.map(cat => {
              const count = STANDS.filter(s => s.category === cat).length;
              const stand = STANDS.find(s => s.category === cat);
              return (
                <button key={cat} onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)} className={`border-r border-b border-gray-200 p-4 text-left transition-all ${filterCategory === cat ? 'bg-[#0F1629]' : 'bg-white hover:bg-gray-50'}`}>
                  <div className="w-8 h-8 mb-3 flex items-center justify-center" style={{ backgroundColor: filterCategory === cat ? `${stand?.color}30` : `${stand?.color}10` }}>
                    <svg className="w-4 h-4" style={{ color: stand?.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={CATEGORY_ICONS[cat] || 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16'} />
                    </svg>
                  </div>
                  <div className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${filterCategory === cat ? 'text-white' : 'text-[#0F1629]'}`}>{cat}</div>
                  <div className={`text-[10px] font-mono ${filterCategory === cat ? 'text-gray-400' : 'text-gray-400'}`}>{count} stand{count !== 1 ? 's' : ''}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0F1629] py-12 px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-emerald-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              </div>
              <span className="text-gray-500 text-xs tracking-[0.1em] uppercase">ZNDS Trade Fair</span>
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
