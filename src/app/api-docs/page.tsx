'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Endpoint {
  method: string;
  path: string;
  description: string;
  params?: Array<{ name: string; type: string; required: boolean; description: string }>;
  example?: { response: string };
}

const ENDPOINTS: Record<string, Endpoint[]> = {
  'Address Generation': [
    { method: 'GET', path: '/api/postcode', description: 'Generate a digital address from GPS coordinates. Returns the unique code, province, sector, and postal area.',
      params: [{ name: 'lat', type: 'number', required: true, description: 'Latitude (-18.5 to -8)' }, { name: 'lng', type: 'number', required: true, description: 'Longitude (21.5 to 33.5)' }],
      example: { response: `{\n  "digitalAddress": "LSA-K28-870183",\n  "postcode": "LSA",\n  "sectorCode": "K28",\n  "postalArea": "LUSAKA",\n  "provinceName": "LUSAKA",\n  "coordinates": { "lat": -15.4183, "lng": 28.287 }\n}` } },
    { method: 'POST', path: '/api/postcode', description: 'Generate a digital address (POST variant). Same as GET but accepts JSON body.',
      params: [{ name: 'lat', type: 'number', required: true, description: 'Latitude' }, { name: 'lng', type: 'number', required: true, description: 'Longitude' }] },
  ],
  'Address Lookup': [
    { method: 'GET', path: '/api/address/lookup', description: 'Look up a digital address to get its coordinates and metadata.',
      params: [{ name: 'address', type: 'string', required: true, description: 'Digital address (e.g. LSA-K28-870183)' }],
      example: { response: `{\n  "found": true,\n  "accuracy": "exact",\n  "digitalAddress": "LSA-K28-870183",\n  "coordinates": { "lat": -15.4183, "lng": 28.287 },\n  "province": "LUSAKA"\n}` } },
    { method: 'GET', path: '/api/address/reverse', description: 'Reverse geocode coordinates to get digital address and nearby POIs.',
      params: [{ name: 'lat', type: 'number', required: true, description: 'Latitude' }, { name: 'lng', type: 'number', required: true, description: 'Longitude' }, { name: 'radius', type: 'number', required: false, description: 'Search radius in km (default: 0.5)' }] },
  ],
  'Search': [
    { method: 'GET', path: '/api/search', description: 'Search for locations, POIs, and digital addresses.',
      params: [{ name: 'q', type: 'string', required: true, description: 'Search query' }, { name: 'limit', type: 'number', required: false, description: 'Max results (default: 20)' }],
      example: { response: `{\n  "query": "Lusaka",\n  "results": [\n    { "type": "region", "province": "Lusaka", "provinceCode": "LSA" },\n    { "type": "poi", "name": "UTH", "category": "hospital" }\n  ]\n}` } },
  ],
  'Points of Interest': [
    { method: 'GET', path: '/api/pois', description: 'List POIs with filters.',
      params: [{ name: 'category', type: 'string', required: false, description: 'Filter by category' }, { name: 'province', type: 'string', required: false, description: 'Province code' }, { name: 'lat', type: 'number', required: false, description: 'Center lat for proximity' }, { name: 'lng', type: 'number', required: false, description: 'Center lng for proximity' }, { name: 'radius', type: 'number', required: false, description: 'Radius in km (default: 10)' }, { name: 'limit', type: 'number', required: false, description: 'Max results (default: 50)' }] },
    { method: 'POST', path: '/api/pois', description: 'Create a new POI. Digital address is auto-generated.',
      params: [{ name: 'name', type: 'string', required: true, description: 'POI name' }, { name: 'latitude', type: 'number', required: true, description: 'Latitude' }, { name: 'longitude', type: 'number', required: true, description: 'Longitude' }, { name: 'category', type: 'string', required: false, description: 'Category' }] },
  ],
  'Areas / Event Zones': [
    { method: 'GET', path: '/api/areas', description: 'List all POI areas.',
      params: [{ name: 'type', type: 'string', required: false, description: 'Filter by area type' }] },
    { method: 'POST', path: '/api/areas', description: 'Create a new area / event zone.',
      params: [{ name: 'name', type: 'string', required: true, description: 'Area name' }, { name: 'bounds', type: 'object', required: true, description: 'Bounds object' }, { name: 'center_lat', type: 'number', required: true, description: 'Center latitude' }, { name: 'center_lng', type: 'number', required: true, description: 'Center longitude' }] },
  ],
  'Reference Data': [
    { method: 'GET', path: '/api/provinces', description: 'List all provinces with statistics.' },
    { method: 'GET', path: '/api/stats', description: 'Get system-wide statistics.' },
  ],
};

const METHOD_STYLES: Record<string, { bg: string; text: string }> = {
  GET: { bg: 'bg-emerald-500', text: 'text-white' },
  POST: { bg: 'bg-blue-500', text: 'text-white' },
  PUT: { bg: 'bg-amber-500', text: 'text-white' },
  DELETE: { bg: 'bg-red-500', text: 'text-white' },
};

export default function ApiDocsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

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
            <span className="text-gray-400 text-xs tracking-[0.15em] uppercase">API Reference</span>
          </div>
          <div className="hidden md:flex items-center gap-0">
            <Link href="/map" className="px-5 py-2 text-xs font-medium text-gray-500 hover:text-[#0F1629] tracking-[0.15em] uppercase transition-colors">MAP</Link>
            <Link href="/admin" className="px-5 py-2 text-xs font-medium text-gray-500 hover:text-[#0F1629] tracking-[0.15em] uppercase transition-colors">ADMIN</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-[#0F1629] py-16 px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-emerald-400 text-xs font-medium tracking-[0.3em] uppercase mb-4">DEVELOPER DOCUMENTATION</div>
          <h1 className="text-3xl md:text-5xl font-bold text-white uppercase leading-[1] tracking-[-0.02em] mb-4">API REFERENCE</h1>
          <p className="text-gray-400 max-w-2xl">
            RESTful API for the Zambia National Digital Addressing System. All endpoints return JSON.
            Base URL: <code className="text-emerald-400 font-mono text-sm">{typeof window !== 'undefined' ? window.location.origin : ''}/api</code>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="space-y-12">
          {Object.entries(ENDPOINTS).map(([section, endpoints]) => (
            <div key={section}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-emerald-500" />
                <h2 className="text-sm font-bold text-[#0F1629] uppercase tracking-[0.15em]">{section}</h2>
              </div>
              <div className="space-y-2">
                {endpoints.map((ep) => {
                  const key = `${ep.method}-${ep.path}`;
                  const isOpen = expanded === key;
                  const style = METHOD_STYLES[ep.method] || METHOD_STYLES.GET;
                  return (
                    <div key={key} className="bg-white border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
                      <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full px-6 py-4 flex items-center gap-4 text-left">
                        <span className={`px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider ${style.bg} ${style.text}`}>{ep.method}</span>
                        <code className="text-sm font-mono text-[#0F1629] flex-1">{ep.path}</code>
                        <span className="text-xs text-gray-400 hidden sm:block max-w-xs truncate">{ep.description}</span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6 border-t border-gray-100 pt-5 space-y-5">
                          <p className="text-sm text-gray-500">{ep.description}</p>
                          {ep.params && (
                            <div>
                              <h4 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-3 font-bold">Parameters</h4>
                              <div className="border border-gray-200 overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead><tr className="bg-[#F5F6F8] border-b border-gray-200"><th className="text-left px-4 py-2.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Name</th><th className="text-left px-4 py-2.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Type</th><th className="text-left px-4 py-2.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Required</th><th className="text-left px-4 py-2.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Description</th></tr></thead>
                                  <tbody>
                                    {ep.params.map(p => (
                                      <tr key={p.name} className="border-b border-gray-100 last:border-0">
                                        <td className="px-4 py-2.5 font-mono text-emerald-600 text-xs font-bold">{p.name}</td>
                                        <td className="px-4 py-2.5 text-blue-500 text-xs font-mono">{p.type}</td>
                                        <td className="px-4 py-2.5">{p.required ? <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider">Required</span> : <span className="text-gray-300 text-[10px] uppercase tracking-wider">Optional</span>}</td>
                                        <td className="px-4 py-2.5 text-gray-500 text-xs">{p.description}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                          {ep.example && (
                            <div>
                              <h4 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-3 font-bold">Response</h4>
                              <pre className="bg-[#0F1629] p-5 text-xs font-mono text-gray-300 overflow-x-auto">{ep.example.response}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Province Codes */}
        <div className="mt-16 bg-white border border-gray-200 p-8">
          <h3 className="text-sm font-bold text-[#0F1629] uppercase tracking-[0.15em] mb-6">Province Codes</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border-t border-l border-gray-200">
            {[['LSA','Lusaka'],['CPB','Copperbelt'],['CEN','Central'],['SOU','Southern'],['EAS','Eastern'],['NOR','Northern'],['MUG','Muchinga'],['WES','Western'],['NWE','North-Western'],['LUA','Luapula']].map(([code,name]) => (
              <div key={code} className="flex items-center gap-3 p-4 border-r border-b border-gray-200">
                <code className="text-emerald-600 font-mono text-xs font-bold">{code}</code>
                <span className="text-xs text-gray-500">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
