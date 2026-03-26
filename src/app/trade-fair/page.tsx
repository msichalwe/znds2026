'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Stand {
  id: string;
  hall: string;
  company: string;
  category: string;
  description: string;
  digitalAddress: string;
  // Position on the ZITF map as percentage (left%, top%)
  mapPos: { left: number; top: number };
  color: string;
  contact: string;
  website: string;
  products: string[];
  standSize: string;
}

const HALLS = [
  { id: 'main-arena', name: 'Main Arena', description: 'Central exhibition arena and main stage', left: 28, top: 62 },
  { id: 'hall-1', name: 'Hall 1', description: 'International pavilions and government exhibits', left: 42, top: 32 },
  { id: 'hall-2', name: 'Hall 2', description: 'Technology and innovation hub', left: 58, top: 28 },
  { id: 'hall-3', name: 'Hall 3', description: 'Agriculture and mining sectors', left: 72, top: 35 },
  { id: 'outdoor-east', name: 'Outdoor East', description: 'Vehicle displays and heavy machinery', left: 82, top: 50 },
  { id: 'food-court', name: 'Food Court', description: 'Restaurants and refreshment area', left: 48, top: 18 },
];

const STANDS: Stand[] = [
  {
    id: 'H1-A01', hall: 'Hall 1', company: 'Zambia Copper Mining Corp', category: 'Mining & Resources',
    description: 'Leading copper and cobalt mining operations across the Copperbelt province. Showcasing sustainable extraction technologies, automated drilling systems, and community development programs that have transformed mining communities.',
    digitalAddress: 'LSA-K28-184370', mapPos: { left: 38, top: 28 }, color: '#10b981',
    contact: 'info@zcmc.co.zm', website: 'www.zcmc.co.zm', standSize: '12m x 8m',
    products: ['Copper Cathodes', 'Cobalt Concentrate', 'Mining Equipment', 'Environmental Solutions'],
  },
  {
    id: 'H1-A02', hall: 'Hall 1', company: 'AgriZam Solutions', category: 'Agriculture',
    description: 'Smart farming solutions for Zambian agriculture. IoT-enabled crop monitoring, precision irrigation systems, and a digital marketplace connecting 50,000+ farmers to buyers across Southern Africa.',
    digitalAddress: 'LSA-K28-185371', mapPos: { left: 44, top: 30 }, color: '#22c55e',
    contact: 'hello@agrizam.zm', website: 'www.agrizam.zm', standSize: '8m x 6m',
    products: ['Smart Sensors', 'Irrigation Systems', 'Farm Analytics Platform', 'Seed Technology'],
  },
  {
    id: 'H2-B01', hall: 'Hall 2', company: 'Lusaka FinTech Hub', category: 'Financial Technology',
    description: 'Digital payment solutions and mobile banking platforms connecting rural communities to the formal financial system. Processing over K2 billion in monthly transactions.',
    digitalAddress: 'LSA-K28-186372', mapPos: { left: 55, top: 24 }, color: '#3b82f6',
    contact: 'info@lusakafintech.zm', website: 'www.lusakafintech.zm', standSize: '10m x 6m',
    products: ['Mobile Money API', 'Digital Lending Platform', 'Payment Gateway', 'Merchant POS'],
  },
  {
    id: 'H2-B02', hall: 'Hall 2', company: 'Digital Zambia Initiative', category: 'Technology',
    description: 'Government-backed digital transformation program. Showcasing the ZNDS digital addressing platform, e-government services, digital ID systems, and smart city infrastructure.',
    digitalAddress: 'LSA-K28-188374', mapPos: { left: 60, top: 28 }, color: '#8b5cf6',
    contact: 'info@digitalzambia.gov.zm', website: 'www.digitalzambia.gov.zm', standSize: '15m x 10m',
    products: ['ZNDS Platform', 'Digital ID System', 'E-Government Portal', 'Smart City Dashboard'],
  },
  {
    id: 'H2-B03', hall: 'Hall 2', company: 'ZamHealth Medical', category: 'Healthcare',
    description: 'Telemedicine solutions connecting 200+ rural clinics to specialist doctors. AI-powered diagnostics achieving 94% accuracy in preliminary screening.',
    digitalAddress: 'LSA-K28-190376', mapPos: { left: 56, top: 32 }, color: '#ef4444',
    contact: 'care@zamhealth.co.zm', website: 'www.zamhealth.co.zm', standSize: '8m x 6m',
    products: ['Telemedicine Kit', 'AI Diagnostics', 'Medical Supply Chain', 'Patient Portal'],
  },
  {
    id: 'H3-C01', hall: 'Hall 3', company: 'ZamPower Energy', category: 'Energy',
    description: 'Renewable energy solutions including 15MW solar farms, micro-hydro installations, and off-grid power systems that have electrified 300+ rural communities.',
    digitalAddress: 'LSA-K28-187373', mapPos: { left: 70, top: 30 }, color: '#f59e0b',
    contact: 'power@zampower.co.zm', website: 'www.zampower.co.zm', standSize: '10m x 8m',
    products: ['Solar Farm Systems', 'Battery Storage', 'Mini-Grid Solutions', 'Energy Monitoring'],
  },
  {
    id: 'H3-C02', hall: 'Hall 3', company: 'EduConnect Zambia', category: 'Education',
    description: 'E-learning platforms and digital classrooms deployed in 500+ Zambian schools. Offline-capable content delivery reaching students in areas without internet connectivity.',
    digitalAddress: 'LSA-K28-191377', mapPos: { left: 74, top: 34 }, color: '#0ea5e9',
    contact: 'learn@educonnect.zm', website: 'www.educonnect.zm', standSize: '8m x 6m',
    products: ['E-Learning Platform', 'Digital Textbooks', 'Teacher Training', 'Offline Content Hub'],
  },
  {
    id: 'H3-C03', hall: 'Hall 3', company: 'Mansa TextileWorks', category: 'Manufacturing',
    description: 'Premium textile manufacturing using locally sourced cotton. Traditional Zambian chitenge patterns reimagined for international fashion markets.',
    digitalAddress: 'LUA-M15-194380', mapPos: { left: 76, top: 38 }, color: '#d946ef',
    contact: 'sales@mansatextiles.zm', website: 'www.mansatextiles.zm', standSize: '6m x 6m',
    products: ['Chitenge Fabrics', 'Fashion Collection', 'Home Textiles', 'Custom Prints'],
  },
  {
    id: 'OE-D01', hall: 'Outdoor East', company: 'Zambezi Logistics', category: 'Transport & Logistics',
    description: 'End-to-end logistics powered by ZNDS digital addressing. Fleet of 200+ vehicles with real-time tracking, achieving 99.2% delivery accuracy across Zambia.',
    digitalAddress: 'LSA-K28-193379', mapPos: { left: 80, top: 48 }, color: '#6366f1',
    contact: 'ship@zambezilogistics.zm', website: 'www.zambezilogistics.zm', standSize: '20m x 15m',
    products: ['Fleet Management', 'Last-Mile Delivery', 'Cold Chain', 'Warehouse Network'],
  },
  {
    id: 'OE-D02', hall: 'Outdoor East', company: 'ZamBuild Construction', category: 'Construction',
    description: 'Prefabricated building solutions and smart construction materials. Delivering affordable housing at 40% lower cost with 60% faster build times.',
    digitalAddress: 'LSA-K28-192378', mapPos: { left: 84, top: 52 }, color: '#78716c',
    contact: 'build@zambuild.co.zm', website: 'www.zambuild.co.zm', standSize: '25m x 15m',
    products: ['Prefab Housing', 'Smart Cement', 'Green Materials', 'Construction Tech'],
  },
  {
    id: 'MA-E01', hall: 'Main Arena', company: 'SafariTech Tours', category: 'Tourism',
    description: 'Luxury safari experiences with VR previews. Award-winning eco-tourism packages covering Victoria Falls, South Luangwa, Lower Zambezi, and Kafue National Park.',
    digitalAddress: 'LSA-K28-189375', mapPos: { left: 30, top: 58 }, color: '#ec4899',
    contact: 'book@safaritechzm.com', website: 'www.safaritech.zm', standSize: '10m x 8m',
    products: ['Safari Packages', 'VR Previews', 'Eco-Lodges', 'Adventure Tours'],
  },
  {
    id: 'MA-E02', hall: 'Main Arena', company: 'Zambia Breweries', category: 'Food & Beverage',
    description: 'Zambia\'s premier beverage company. Showcasing new craft beer range, traditional munkoyo-inspired drinks, and sustainable brewing technologies.',
    digitalAddress: 'LSA-K28-195381', mapPos: { left: 26, top: 64 }, color: '#b45309',
    contact: 'info@zambrew.co.zm', website: 'www.zambrew.co.zm', standSize: '12m x 10m',
    products: ['Mosi Lager', 'Craft Range', 'Munkoyo Drinks', 'Sustainable Brewing'],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Mining & Resources': '#10b981', 'Agriculture': '#22c55e', 'Financial Technology': '#3b82f6',
  'Technology': '#8b5cf6', 'Healthcare': '#ef4444', 'Energy': '#f59e0b',
  'Education': '#0ea5e9', 'Manufacturing': '#d946ef', 'Transport & Logistics': '#6366f1',
  'Construction': '#78716c', 'Tourism': '#ec4899', 'Food & Beverage': '#b45309',
};

export default function TradeFairPage() {
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const [hoveredStand, setHoveredStand] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [activeSection, setActiveSection] = useState<'map' | 'exhibitors' | 'info'>('map');
  const [mapZoom, setMapZoom] = useState(1);
  const [userPos, setUserPos] = useState({ left: 20, top: 75 });
  const [showUser, setShowUser] = useState(true);
  const [copied, setCopied] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Animate visitor walking through the fair
  useEffect(() => {
    if (!showUser) return;
    const route = [
      { left: 20, top: 75 }, // Gate entrance
      { left: 28, top: 62 }, // Main Arena
      { left: 38, top: 45 }, // Walking to Hall 1
      { left: 42, top: 32 }, // Hall 1
      { left: 55, top: 28 }, // Hall 2
      { left: 72, top: 35 }, // Hall 3
      { left: 82, top: 50 }, // Outdoor East
      { left: 48, top: 18 }, // Food Court
      { left: 30, top: 58 }, // Back to Arena
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % route.length;
      setUserPos(route[i]);
    }, 4000);
    return () => clearInterval(interval);
  }, [showUser]);

  const categories = [...new Set(STANDS.map(s => s.category))];
  const filtered = filterCategory ? STANDS.filter(s => s.category === filterCategory) : STANDS;
  const hallGroups = STANDS.reduce((acc, s) => {
    if (!acc[s.hall]) acc[s.hall] = [];
    acc[s.hall].push(s);
    return acc;
  }, {} as Record<string, Stand[]>);

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#0F1629] flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              </div>
              <span className="text-[#0F1629] font-bold text-lg tracking-tight">ZNDS</span>
            </Link>
            <span className="text-gray-300 hidden sm:inline">/</span>
            <span className="text-gray-400 text-xs tracking-[0.15em] uppercase hidden sm:inline">ZITF 2026</span>
          </div>
          <div className="hidden md:flex items-center gap-0">
            <Link href="/" className="px-5 py-2 text-xs font-medium text-gray-500 hover:text-[#0F1629] tracking-[0.15em] uppercase transition-colors">HOME</Link>
            <Link href="/map" className="px-5 py-2 text-xs font-medium text-gray-500 hover:text-[#0F1629] tracking-[0.15em] uppercase transition-colors">MAP</Link>
            <Link href="/api-docs" className="px-5 py-2 text-xs font-medium text-gray-500 hover:text-[#0F1629] tracking-[0.15em] uppercase transition-colors">API</Link>
            <Link href="/admin" className="px-5 py-2 text-xs font-medium text-gray-500 hover:text-[#0F1629] tracking-[0.15em] uppercase transition-colors">ADMIN</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-[#0F1629] pt-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="relative max-w-[1400px] mx-auto px-6 md:px-8 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <div className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[10px] font-bold tracking-[0.3em] uppercase">LIVE EVENT</span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white uppercase leading-[0.95] tracking-[-0.03em] mb-6">
                ZAMBIA
                <br />
                INTERNATIONAL
                <br />
                <span className="text-emerald-400">TRADE FAIR</span>
              </h1>
              <p className="text-gray-400 text-base md:text-lg max-w-lg leading-relaxed mb-8">
                The largest trade exhibition in Zambia. Navigate {STANDS.length} exhibitors across 6 halls using ZNDS digital addresses for precise stand-level navigation.
              </p>

              <div className="grid grid-cols-3 gap-0 border border-white/10 mb-8">
                {[
                  { label: 'DATE', value: '15-22 JUL', sub: '2026' },
                  { label: 'VENUE', value: 'LUSAKA', sub: 'Showgrounds' },
                  { label: 'STANDS', value: String(STANDS.length), sub: 'Exhibitors' },
                ].map((item, i) => (
                  <div key={item.label} className={`p-4 ${i < 2 ? 'border-r border-white/10' : ''}`}>
                    <div className="text-[9px] text-gray-500 tracking-[0.25em] uppercase font-bold mb-1">{item.label}</div>
                    <div className="text-white font-bold text-lg tracking-tight">{item.value}</div>
                    <div className="text-gray-500 text-[11px]">{item.sub}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => { setActiveSection('map'); document.getElementById('site-map')?.scrollIntoView({ behavior: 'smooth' }); }} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold tracking-[0.15em] uppercase transition-colors flex items-center gap-2">
                  VIEW SITE MAP
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <button onClick={() => { setActiveSection('exhibitors'); document.getElementById('exhibitors')?.scrollIntoView({ behavior: 'smooth' }); }} className="px-6 py-3 border border-white/20 text-white text-xs font-bold tracking-[0.15em] uppercase hover:bg-white/5 transition-colors">
                  ALL EXHIBITORS
                </button>
              </div>
            </div>

            {/* Mini map preview */}
            <div className="hidden md:block relative">
              <div className="relative overflow-hidden border border-white/10" style={{ aspectRatio: '4/3' }}>
                <Image src="/zitf-map.jpg" alt="ZITF Site Layout" fill className="object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1629] via-transparent to-[#0F1629]/50" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0F1629]/80 to-transparent" />
                {/* Pulsing dots on the preview */}
                {STANDS.slice(0, 5).map(s => (
                  <div key={s.id} className="absolute w-2 h-2" style={{ left: `${s.mapPos.left}%`, top: `${s.mapPos.top}%` }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: s.color }} />
                  </div>
                ))}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-[10px] text-emerald-400 tracking-[0.2em] uppercase font-bold mb-1">LUSAKA SHOWGROUNDS</div>
                  <div className="text-white text-sm font-bold">SITE LAYOUT 2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 flex items-center justify-between">
          <div className="flex gap-0">
            {[
              { key: 'map' as const, label: 'SITE MAP' },
              { key: 'exhibitors' as const, label: 'EXHIBITORS' },
              { key: 'info' as const, label: 'VISITOR INFO' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveSection(tab.key)} className={`px-5 py-4 text-xs font-bold uppercase tracking-[0.15em] border-b-2 transition-all ${activeSection === tab.key ? 'border-emerald-500 text-[#0F1629]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          {filterCategory && (
            <button onClick={() => setFilterCategory('')} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-xs text-gray-600 hover:bg-gray-200 transition-colors">
              <span className="w-2 h-2" style={{ backgroundColor: CATEGORY_COLORS[filterCategory] }} />
              {filterCategory}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-8">

        {/* ═══ SITE MAP SECTION ═══ */}
        {activeSection === 'map' && (
          <div id="site-map" className="space-y-8">
            {/* Map Controls */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0F1629] uppercase tracking-tight">Zambia International Trade Fair</h2>
                <p className="text-sm text-gray-400">Lusaka Showgrounds &mdash; Click a marker to view stand details</p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => setShowUser(!showUser)} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider border transition-all ${showUser ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                  <span className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    VISITOR
                  </span>
                </button>
                <div className="flex border border-gray-200">
                  <button onClick={() => setMapZoom(z => Math.max(1, z - 0.25))} className="px-3 py-2 text-gray-400 hover:text-[#0F1629] transition-colors border-r border-gray-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                  </button>
                  <div className="px-3 py-2 text-[10px] font-mono text-gray-500 font-bold min-w-[48px] text-center">{Math.round(mapZoom * 100)}%</div>
                  <button onClick={() => setMapZoom(z => Math.min(2, z + 0.25))} className="px-3 py-2 text-gray-400 hover:text-[#0F1629] transition-colors border-l border-gray-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Map */}
            <div className="bg-white border border-gray-200 overflow-hidden">
              <div ref={mapContainerRef} className="relative overflow-auto" style={{ maxHeight: '75vh' }}>
                <div className="relative" style={{ transform: `scale(${mapZoom})`, transformOrigin: 'top left', transition: 'transform 0.3s ease' }}>
                  {/* The actual ZITF map image */}
                  <div className="relative" style={{ aspectRatio: '1.4/1', minWidth: '900px' }}>
                    <Image src="/zitf-map.jpg" alt="ZITF Lusaka Showgrounds Site Layout" fill className="object-contain" priority />

                    {/* Stand markers overlaid on the map */}
                    {filtered.map(stand => {
                      const isHovered = hoveredStand === stand.id;
                      const isSelected = selectedStand?.id === stand.id;
                      return (
                        <button
                          key={stand.id}
                          className="absolute group"
                          style={{ left: `${stand.mapPos.left}%`, top: `${stand.mapPos.top}%`, transform: 'translate(-50%, -50%)', zIndex: isHovered || isSelected ? 30 : 10 }}
                          onClick={() => setSelectedStand(stand)}
                          onMouseEnter={() => setHoveredStand(stand.id)}
                          onMouseLeave={() => setHoveredStand(null)}
                        >
                          {/* Pulse ring */}
                          <div className="absolute inset-0 -m-2">
                            <div className="w-full h-full rounded-full animate-ping opacity-20" style={{ backgroundColor: stand.color, animationDuration: '3s' }} />
                          </div>
                          {/* Marker dot */}
                          <div className="relative w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-125" style={{ backgroundColor: stand.color }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                          {/* Tooltip */}
                          {(isHovered || isSelected) && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap pointer-events-none">
                              <div className="bg-[#0F1629] text-white px-3 py-2 shadow-xl" style={{ minWidth: '180px' }}>
                                <div className="text-[9px] font-mono font-bold tracking-wider mb-0.5" style={{ color: stand.color }}>{stand.id}</div>
                                <div className="text-xs font-bold mb-0.5">{stand.company}</div>
                                <div className="text-[10px] text-gray-400">{stand.hall}</div>
                                <div className="flex items-center gap-1 mt-1">
                                  <div className="w-1 h-1 bg-emerald-400" />
                                  <span className="text-[9px] font-mono text-emerald-400">{stand.digitalAddress}</span>
                                </div>
                              </div>
                              <div className="w-2 h-2 bg-[#0F1629] rotate-45 mx-auto -mt-1" />
                            </div>
                          )}
                        </button>
                      );
                    })}

                    {/* Animated visitor */}
                    {showUser && (
                      <div className="absolute z-20 pointer-events-none" style={{ left: `${userPos.left}%`, top: `${userPos.top}%`, transform: 'translate(-50%, -50%)', transition: 'left 3s ease-in-out, top 3s ease-in-out' }}>
                        <div className="relative floor-plan-user">
                          <div className="w-7 h-7 bg-[#0F1629] rounded-full border-2 border-emerald-400 flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 15px rgba(16,185,129,0.5)' }}>
                            <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                            </svg>
                          </div>
                          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-[#0F1629] text-emerald-400 text-[7px] font-mono font-bold px-1.5 py-0.5 tracking-wider whitespace-nowrap">
                            YOU
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hall labels on map */}
                    {HALLS.map(hall => (
                      <div key={hall.id} className="absolute pointer-events-none" style={{ left: `${hall.left}%`, top: `${hall.top}%`, transform: 'translate(-50%, -50%)' }}>
                        <div className="text-[8px] font-bold text-[#0F1629]/30 tracking-[0.15em] uppercase whitespace-nowrap">{hall.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Map Legend */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <span className="text-[10px] text-gray-400 tracking-[0.15em] uppercase font-bold mr-2">FILTER:</span>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)} className={`flex items-center gap-1.5 text-[11px] transition-all ${filterCategory === cat ? 'font-bold text-[#0F1629]' : 'text-gray-400 hover:text-gray-600'}`}>
                      <span className="w-2.5 h-2.5 rounded-full border-2" style={{ backgroundColor: filterCategory === cat ? CATEGORY_COLORS[cat] : 'transparent', borderColor: CATEGORY_COLORS[cat] }} />
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hall Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 border-t border-l border-gray-200">
              {HALLS.map(hall => {
                const count = STANDS.filter(s => s.hall === hall.name).length;
                return (
                  <div key={hall.id} className="bg-white border-r border-b border-gray-200 p-5 hover:bg-gray-50 transition-colors">
                    <div className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-bold mb-2">{hall.name}</div>
                    <div className="text-2xl font-bold text-[#0F1629] mb-1">{count}</div>
                    <div className="text-[11px] text-gray-400">{hall.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ EXHIBITORS SECTION ═══ */}
        {activeSection === 'exhibitors' && (
          <div id="exhibitors" className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0F1629] uppercase tracking-tight">All Exhibitors</h2>
                <p className="text-sm text-gray-400">{filtered.length} exhibitor{filtered.length !== 1 ? 's' : ''} {filterCategory ? `in ${filterCategory}` : 'across all categories'}</p>
              </div>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 text-xs text-gray-600 focus:outline-none tracking-wide uppercase">
                <option value="">All categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Grouped by Hall */}
            {Object.entries(hallGroups).map(([hall, stands]) => {
              const hallStands = filterCategory ? stands.filter(s => s.category === filterCategory) : stands;
              if (hallStands.length === 0) return null;
              return (
                <div key={hall}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-5 bg-emerald-500" />
                    <h3 className="text-xs font-bold text-[#0F1629] uppercase tracking-[0.15em]">{hall}</h3>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 font-mono font-bold">{hallStands.length}</span>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {hallStands.map((stand, idx) => (
                      <div key={stand.id} className="stand-appear trade-fair-stand bg-white border border-gray-200 hover:border-gray-300 cursor-pointer overflow-hidden" style={{ animationDelay: `${idx * 0.08}s` }} onClick={() => setSelectedStand(stand)}>
                        {/* Color bar */}
                        <div className="h-1" style={{ backgroundColor: stand.color }} />
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="text-[10px] font-mono font-bold tracking-wider mb-1" style={{ color: stand.color }}>{stand.id}</div>
                              <div className="text-base font-bold text-[#0F1629] mb-1">{stand.company}</div>
                            </div>
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${stand.color}10`, color: stand.color }}>{stand.category}</span>
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{stand.description}</p>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {stand.products.slice(0, 3).map(p => (
                              <span key={p} className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-[10px] text-gray-500 tracking-wider">{p}</span>
                            ))}
                            {stand.products.length > 3 && <span className="text-[10px] text-gray-400">+{stand.products.length - 3}</span>}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-emerald-500" />
                              <span className="text-[11px] font-mono text-emerald-600 font-bold">{stand.digitalAddress}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
                              {stand.standSize}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ VISITOR INFO SECTION ═══ */}
        {activeSection === 'info' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-[#0F1629] uppercase tracking-tight mb-2">Visitor Information</h2>
              <p className="text-sm text-gray-400">Everything you need to know for your visit to ZITF 2026</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Event Details */}
              <div className="bg-white border border-gray-200 p-8">
                <h3 className="text-xs font-bold text-[#0F1629] uppercase tracking-[0.15em] mb-6">Event Details</h3>
                <div className="space-y-0 border-t border-gray-100">
                  {[
                    { label: 'Event', value: 'Zambia International Trade Fair 2026' },
                    { label: 'Dates', value: '15 - 22 July 2026' },
                    { label: 'Venue', value: 'Lusaka Showgrounds, Great East Road' },
                    { label: 'Opening Hours', value: '09:00 - 18:00 daily' },
                    { label: 'Admission', value: 'K150 (Adults) / K75 (Students)' },
                    { label: 'Digital Address', value: 'LSA-K28-184370' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3.5 border-b border-gray-100">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">{item.label}</span>
                      <span className="text-sm text-[#0F1629] font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* How to Navigate */}
              <div className="bg-white border border-gray-200 p-8">
                <h3 className="text-xs font-bold text-[#0F1629] uppercase tracking-[0.15em] mb-6">Navigate with ZNDS</h3>
                <div className="space-y-6">
                  {[
                    { step: '01', title: 'Find the Stand Code', desc: 'Each exhibition stand has a unique ZNDS digital address displayed at the entrance. Example: LSA-K28-184370' },
                    { step: '02', title: 'Search on the Map', desc: 'Enter the digital address in the ZNDS map search bar to instantly locate any stand within the showgrounds.' },
                    { step: '03', title: 'Get Directions', desc: 'Use the directions feature to navigate from your current location to any stand with turn-by-turn guidance.' },
                    { step: '04', title: 'Explore Nearby', desc: 'Discover nearby exhibitors, food courts, and facilities using the proximity search feature.' },
                  ].map(item => (
                    <div key={item.step} className="flex gap-4">
                      <div className="text-emerald-500 font-mono font-bold text-sm shrink-0">{item.step}</div>
                      <div>
                        <div className="text-sm font-bold text-[#0F1629] uppercase tracking-wide mb-1">{item.title}</div>
                        <div className="text-sm text-gray-500 leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gates & Access */}
              <div className="bg-white border border-gray-200 p-8">
                <h3 className="text-xs font-bold text-[#0F1629] uppercase tracking-[0.15em] mb-6">Gates & Access Points</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Gate 1 — Main Entrance (Great East Road)', 'Gate 2 — VIP & Exhibitor Access', 'Gate 3 — Staff & Media', 'Gate 4 — Parking & Delivery', 'Gate 5 — Emergency Exit', 'Gate 6 — Eastern Access'].map((gate, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-gray-50">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      <span className="text-xs text-gray-600">{gate}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div className="bg-white border border-gray-200 p-8">
                <h3 className="text-xs font-bold text-[#0F1629] uppercase tracking-[0.15em] mb-6">Facilities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: 'M3 3h18v18H3V3zm2 2v6h6V5H5zm8 0v6h6V5h-6zm-8 8v6h6v-6H5zm8 0v6h6v-6h-6z', label: 'Free WiFi' },
                    { icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: 'Charging Stations' },
                    { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Rest Areas' },
                    { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', label: 'Info Desks' },
                    { icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', label: 'First Aid' },
                    { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1', label: 'ATM / Mobile Money' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                      <span className="text-xs text-gray-600">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ STAND DETAIL MODAL ═══ */}
      {selectedStand && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" onClick={() => setSelectedStand(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header bar */}
            <div className="h-1.5" style={{ backgroundColor: selectedStand.color }} />
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono font-bold tracking-wider px-2 py-0.5" style={{ backgroundColor: `${selectedStand.color}10`, color: selectedStand.color }}>{selectedStand.id}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">{selectedStand.hall}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#0F1629] uppercase tracking-tight">{selectedStand.company}</h2>
                </div>
                <button onClick={() => setSelectedStand(null)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-4" style={{ backgroundColor: `${selectedStand.color}08` }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedStand.color }} />
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: selectedStand.color }}>{selectedStand.category}</span>
              </div>

              <p className="text-gray-500 leading-relaxed mb-8">{selectedStand.description}</p>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-0 border border-gray-200 mb-8">
                {[
                  { label: 'DIGITAL ADDRESS', value: selectedStand.digitalAddress, mono: true, color: 'text-emerald-600' },
                  { label: 'STAND SIZE', value: selectedStand.standSize, mono: false, color: 'text-gray-700' },
                  { label: 'CONTACT', value: selectedStand.contact, mono: false, color: 'text-gray-700' },
                  { label: 'WEBSITE', value: selectedStand.website, mono: false, color: 'text-blue-600' },
                ].map((item, i) => (
                  <div key={item.label} className={`p-4 ${i < 2 ? 'border-b border-gray-200' : ''} ${i % 2 === 0 ? 'border-r border-gray-200' : ''}`}>
                    <div className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-1.5">{item.label}</div>
                    <div className={`text-sm font-medium ${item.mono ? 'font-mono font-bold' : ''} ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Products */}
              <div className="mb-8">
                <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-3">PRODUCTS & SERVICES</div>
                <div className="flex flex-wrap gap-2">
                  {selectedStand.products.map(p => (
                    <span key={p} className="px-3 py-1.5 border border-gray-200 text-xs text-gray-600 hover:border-gray-300 transition-colors">{p}</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Link href={`/map?q=${selectedStand.digitalAddress}`} className="flex-1 px-6 py-3.5 bg-[#0F1629] text-white text-xs font-bold tracking-[0.15em] uppercase hover:bg-[#1a2240] transition-colors text-center flex items-center justify-center gap-2">
                  NAVIGATE TO STAND
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <button onClick={() => copyAddress(selectedStand.digitalAddress)} className="px-6 py-3.5 border border-gray-200 text-gray-600 text-xs font-bold tracking-[0.15em] uppercase hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-2">
                  {copied ? 'COPIED' : 'COPY ADDRESS'}
                  {copied ? (
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#0F1629] py-16 px-6 md:px-8 mt-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-emerald-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                </div>
                <div>
                  <div className="text-white font-bold text-sm tracking-tight">ZNDS</div>
                  <div className="text-gray-500 text-[10px] tracking-wider uppercase">Trade Fair Navigator</div>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Navigate the Zambia International Trade Fair using ZNDS digital addresses. Every stand, every hall, precisely located.
              </p>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-bold mb-4">QUICK LINKS</div>
              <div className="space-y-2">
                {[
                  { label: 'Home', href: '/' }, { label: 'Interactive Map', href: '/map' },
                  { label: 'API Documentation', href: '/api-docs' }, { label: 'Admin Dashboard', href: '/admin' },
                ].map(link => (
                  <Link key={link.href} href={link.href} className="block text-sm text-gray-500 hover:text-emerald-400 transition-colors">{link.label}</Link>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-bold mb-4">VENUE</div>
              <div className="text-sm text-gray-500 leading-relaxed">
                Lusaka Showgrounds<br />
                Great East Road<br />
                Lusaka, Zambia<br />
                <span className="text-emerald-400 font-mono text-xs font-bold">LSA-K28-184370</span>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-600 text-[11px] tracking-[0.1em] uppercase">
              Powered by ZICTA &middot; Republic of Zambia &middot; {new Date().getFullYear()}
            </div>
            <div className="text-gray-600 text-[11px]">
              ZNDS &mdash; Zambia National Digital Addressing System
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
