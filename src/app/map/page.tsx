'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import SearchBox from '@/components/map/SearchBox';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

interface SelectedLocation {
  lat: number; lng: number; digitalAddress: string; province: string; postalArea: string; sectorCode: string;
}

interface POI {
  id: string; name: string; category: string; latitude: number; longitude: number; digital_code: string; description: string; address: string;
}

const THEME_OPTIONS = [
  { key: 'osm', label: 'OSM', icon: '🗺️' },
  { key: 'light', label: 'Light', icon: '☁️' },
  { key: 'roadmap', label: 'Road', icon: '🛣️' },
  { key: 'satellite', label: 'Satellite', icon: '🛰️' },
  { key: 'terrain', label: 'Terrain', icon: '⛰️' },
  { key: 'watercolor', label: 'Art', icon: '🎨' },
  { key: 'topo', label: 'Topo', icon: '📐' },
];

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [centerLocation, setCenterLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [directionsDestination, setDirectionsDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [pois, setPois] = useState<POI[]>([]);
  const [showPois, setShowPois] = useState(true);
  const [mapTheme, setMapTheme] = useState('roadmap');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'info' | 'pois'>('info');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [measurementMode, setMeasurementMode] = useState<'off' | 'distance' | 'area'>('off');
  const [measurementResult, setMeasurementResult] = useState<{ type: string; value: number; unit: string } | null>(null);


  useEffect(() => {
    fetch('/api/pois?limit=200').then(r => r.json()).then(d => setPois(d.pois || [])).catch(() => {});
  }, []);

  const handleLocationSelect = useCallback((location: SelectedLocation) => {
    setSelectedLocation(location);
    setSidebarTab('info');
  }, []);

  const handleCopy = async (text: string, label: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else { const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (e) { console.error('Copy failed:', e); }
  };



  const handleGoToLocation = useCallback((lat: number, lng: number) => { setCenterLocation({ lat, lng }); }, []);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <div className="h-14 bg-white/95 backdrop-blur-xl border-b border-gray-200 flex items-center px-4 gap-3 z-[1100] shrink-0 relative">
        <Link href="/" className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <span className="text-gray-900 font-semibold text-sm hidden sm:block">ZNDS</span>
        </Link>

        <SearchBox onGoToLocation={handleGoToLocation} />

        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowPois(!showPois)} className={`px-2.5 py-1.5 text-xs rounded-lg border transition-all ${showPois ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>POIs</button>

          <div className="relative hidden sm:block">
            <button onClick={() => { if (measurementMode === 'off') setMeasurementMode('distance'); else if (measurementMode === 'distance') setMeasurementMode('area'); else { setMeasurementMode('off'); setMeasurementResult(null); } }}
              className={`px-2.5 py-1.5 text-xs rounded-lg border transition-all ${measurementMode !== 'off' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
              title={measurementMode === 'off' ? 'Measure Distance' : measurementMode === 'distance' ? 'Switch to Area' : 'Turn Off'}>
              {measurementMode === 'off' ? '📏' : measurementMode === 'distance' ? '📏 Dist' : '📐 Area'}
            </button>
          </div>

          <div className="relative">
            <button onClick={() => setShowThemeSelector(!showThemeSelector)} className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all" title="Map Theme">
              {THEME_OPTIONS.find(t => t.key === mapTheme)?.icon || '🗺️'}
            </button>
            {showThemeSelector && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 w-36">
                {THEME_OPTIONS.map(theme => (
                  <button key={theme.key} onClick={() => { setMapTheme(theme.key); setShowThemeSelector(false); }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors ${mapTheme === theme.key ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <span>{theme.icon}</span><span>{theme.label}</span>
                    {mapTheme === theme.key && <svg className="w-3 h-3 ml-auto text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden shrink-0 hidden lg:flex">
          <div className="flex border-b border-gray-100">
            {(['info', 'pois'] as const).map(tab => (
              <button key={tab} onClick={() => setSidebarTab(tab)}
                className={`flex-1 px-4 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${sidebarTab === tab ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}>
                {tab === 'info' ? 'Location' : `POIs (${pois.length})`}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {sidebarTab === 'info' && (
              <>
                {selectedLocation ? (
                  <div className="p-4 space-y-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4">
                      <div className="text-xs text-emerald-600 uppercase tracking-wider font-medium mb-1">Digital Address</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-mono font-bold text-emerald-700">{selectedLocation.digitalAddress}</span>
                        <button onClick={() => handleCopy(selectedLocation.digitalAddress, 'address')} className="p-1.5 hover:bg-white/50 rounded-lg transition-colors">
                          {copySuccess === 'address' ? <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          : <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>}
                        </button>
                      </div>
                    </div>

                    {[
                      { label: 'Province', value: selectedLocation.province },
                      { label: 'Postal Area', value: selectedLocation.postalArea },
                      { label: 'Sector', value: selectedLocation.sectorCode },
                      { label: 'Latitude', value: selectedLocation.lat.toFixed(6) },
                      { label: 'Longitude', value: selectedLocation.lng.toFixed(6) },
                    ].map(d => (
                      <div key={d.label} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-xs text-gray-400">{d.label}</span>
                        <span className="text-sm text-gray-800 font-medium">{d.value}</span>
                      </div>
                    ))}

                    {measurementResult && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <div className="text-xs text-amber-600 uppercase tracking-wider font-medium mb-1">{measurementResult.type === 'distance' ? 'Distance' : 'Area'}</div>
                        <div className="text-lg font-mono font-bold text-amber-700">{measurementResult.value.toFixed(2)} {measurementResult.unit}</div>
                      </div>
                    )}

                    <div className="space-y-2 pt-2">
                      <button onClick={() => handleCopy(`${selectedLocation.lat.toFixed(6)},${selectedLocation.lng.toFixed(6)}`, 'coords')} className="w-full py-2 px-3 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 transition-all">
                        {copySuccess === 'coords' ? 'Copied!' : 'Copy Coordinates'}
                      </button>
                      <button onClick={() => setDirectionsDestination({ lat: selectedLocation.lat, lng: selectedLocation.lng })} className="w-full py-2 px-3 text-sm bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-indigo-700 transition-all flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                        Get Directions
                      </button>
                      <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedLocation.lat},${selectedLocation.lng}`, '_blank')} className="w-full py-2 px-3 text-sm bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 transition-all">Open in Google Maps</button>
                    </div>

                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm mb-1">Click on the map</p>
                    <p className="text-gray-400 text-xs">to generate a digital address for any location</p>
                  </div>
                )}
              </>
            )}

            {sidebarTab === 'pois' && (
              <div className="p-4 space-y-2">
                {pois.length === 0 ? <p className="text-center text-gray-400 text-sm py-8">No POIs yet. Click the map and add one.</p>
                : pois.map(poi => (
                  <button key={poi.id} onClick={() => setCenterLocation({ lat: poi.latitude, lng: poi.longitude })} className="w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-left transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 font-medium truncate">{poi.name}</div>
                        <div className="text-xs text-gray-400 capitalize">{poi.category} {poi.digital_code && `· ${poi.digital_code}`}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <LeafletMap
            onLocationSelect={handleLocationSelect}
            centerLocation={centerLocation}
            directionsDestination={directionsDestination}
            onDirectionsCalculated={() => {}}
            onDirectionsCleared={() => setDirectionsDestination(null)}
            mapTheme={mapTheme}
            pois={pois} areas={[]}
            showPois={showPois} showAreas={false}
            measurementMode={measurementMode} onMeasurementResult={setMeasurementResult}
          />

          {selectedLocation && (
            <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-4 z-[500]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-emerald-600 uppercase tracking-wider font-medium">Digital Address</div>
                <button onClick={() => setSelectedLocation(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-mono font-bold text-emerald-700">{selectedLocation.digitalAddress}</span>
                <button onClick={() => handleCopy(selectedLocation.digitalAddress, 'address')} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-lg font-medium border border-emerald-200">
                  {copySuccess === 'address' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>{selectedLocation.province}</span>
                <span>Sector: {selectedLocation.sectorCode}</span>
                <span>{selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
