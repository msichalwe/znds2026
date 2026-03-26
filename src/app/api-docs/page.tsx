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

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  POST: 'bg-blue-50 text-blue-700 border-blue-200',
  PUT: 'bg-amber-50 text-amber-700 border-amber-200',
  DELETE: 'bg-red-50 text-red-700 border-red-200',
};

export default function ApiDocsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              </div>
              <span className="text-gray-900 font-semibold text-sm">ZNDS</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500 text-sm">API Documentation</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/map" className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">Map</Link>
            <Link href="/admin" className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">Admin</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">API Reference</h1>
          <p className="text-gray-500 max-w-2xl">
            RESTful API for the Zambia Digital Addressing System. All endpoints return JSON.
            Base URL: <code className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-sm border border-emerald-100">{typeof window !== 'undefined' ? window.location.origin : ''}/api</code>
          </p>
        </div>

        <div className="space-y-10">
          {Object.entries(ENDPOINTS).map(([section, endpoints]) => (
            <div key={section}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-emerald-500 rounded-full" />
                {section}
              </h2>
              <div className="space-y-3">
                {endpoints.map((ep) => {
                  const key = `${ep.method}-${ep.path}`;
                  const isOpen = expanded === key;
                  return (
                    <div key={key} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors shadow-sm">
                      <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full px-5 py-4 flex items-center gap-4 text-left">
                        <span className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded border ${METHOD_COLORS[ep.method]}`}>{ep.method}</span>
                        <code className="text-sm font-mono text-gray-700 flex-1">{ep.path}</code>
                        <span className="text-xs text-gray-400 hidden sm:block max-w-xs truncate">{ep.description}</span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                          <p className="text-sm text-gray-500">{ep.description}</p>
                          {ep.params && (
                            <div>
                              <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-medium">Parameters</h4>
                              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                <table className="w-full text-sm">
                                  <thead><tr className="border-b border-gray-100"><th className="text-left px-3 py-2 text-gray-400 text-xs font-medium">Name</th><th className="text-left px-3 py-2 text-gray-400 text-xs font-medium">Type</th><th className="text-left px-3 py-2 text-gray-400 text-xs font-medium">Required</th><th className="text-left px-3 py-2 text-gray-400 text-xs font-medium">Description</th></tr></thead>
                                  <tbody>
                                    {ep.params.map(p => (
                                      <tr key={p.name} className="border-b border-gray-100 last:border-0">
                                        <td className="px-3 py-2 font-mono text-emerald-700 text-xs">{p.name}</td>
                                        <td className="px-3 py-2 text-blue-600 text-xs">{p.type}</td>
                                        <td className="px-3 py-2">{p.required ? <span className="text-red-500 text-xs font-medium">required</span> : <span className="text-gray-300 text-xs">optional</span>}</td>
                                        <td className="px-3 py-2 text-gray-500 text-xs">{p.description}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                          {ep.example && (
                            <div>
                              <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-medium">Response Example</h4>
                              <pre className="bg-gray-900 rounded-lg p-4 text-xs font-mono text-gray-300 overflow-x-auto">{ep.example.response}</pre>
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

        <div className="mt-16 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-gray-900 font-semibold mb-2">Province Codes</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
            {[['LSA','Lusaka'],['CPB','Copperbelt'],['CEN','Central'],['SOU','Southern'],['EAS','Eastern'],['NOR','Northern'],['MUG','Muchinga'],['WES','Western'],['NWE','North-Western'],['LUA','Luapula']].map(([code,name]) => (
              <div key={code} className="flex items-center gap-2 text-gray-500">
                <code className="text-emerald-700 font-mono text-xs font-bold">{code}</code>
                <span className="text-xs">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
