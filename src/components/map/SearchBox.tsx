'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

type SearchType = 'location' | 'digital_address';

interface SearchResult {
  label: string;
  sublabel: string;
  lat: number;
  lng: number;
  type: SearchType;
  source: string;
}

interface SearchBoxProps {
  onGoToLocation: (lat: number, lng: number) => void;
  onSearch?: (query: string) => void;
}

interface QuickSearch {
  label: string;
  query: string;
  type: SearchType;
  icon: string;
}

const QUICK_SEARCHES: QuickSearch[] = [
  { label: 'Lusaka City', query: 'Lusaka, Zambia', type: 'location', icon: '🏙️' },
  { label: 'Ndola', query: 'Ndola, Zambia', type: 'location', icon: '🏭' },
  { label: 'Kitwe', query: 'Kitwe, Zambia', type: 'location', icon: '⛏️' },
  { label: 'Livingstone', query: 'Livingstone, Zambia', type: 'location', icon: '🌊' },
  { label: 'Chipata', query: 'Chipata, Zambia', type: 'location', icon: '🌾' },
  { label: 'Kabwe', query: 'Kabwe, Zambia', type: 'location', icon: '🏘️' },
];

const DIGITAL_ADDRESS_PATTERN = /^[A-Z]{3}-[A-Z0-9]{3}-[0-9]{6}$/;
const PARTIAL_DA_PATTERN = /^[A-Z]{1,3}(-[A-Z0-9]{0,3}(-[0-9]{0,6})?)?$/;

function detectSearchType(input: string): SearchType {
  const cleaned = input.trim().toUpperCase();
  if (DIGITAL_ADDRESS_PATTERN.test(cleaned) || PARTIAL_DA_PATTERN.test(cleaned)) return 'digital_address';
  return 'location';
}

export default function SearchBox({ onGoToLocation, onSearch }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>('location');
  const [isSearching, setIsSearching] = useState(false);
  const [showQuickSearches, setShowQuickSearches] = useState(false);
  const [searchHistory, setSearchHistory] = useState<Array<{ query: string; type: SearchType }>>([]);
  const [validationHint, setValidationHint] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try { const saved = localStorage.getItem('zambia-address-search-history'); if (saved) setSearchHistory(JSON.parse(saved)); } catch (_) { /* */ }
  }, []);

  const addToHistory = useCallback((q: string, type: SearchType) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(h => h.query !== q);
      const updated = [{ query: q, type }, ...filtered].slice(0, 10);
      try { localStorage.setItem('zambia-address-search-history', JSON.stringify(updated)); } catch (_) { /* */ }
      return updated;
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowQuickSearches(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const cleaned = query.trim().toUpperCase();
    const type = detectSearchType(cleaned);
    setSearchType(type);
    if (type === 'digital_address' && cleaned.length > 0) {
      setValidationHint(DIGITAL_ADDRESS_PATTERN.test(cleaned) ? '' : 'Format: XXX-XXX-XXXXXX (e.g., LSA-K28-870183)');
    } else {
      setValidationHint('');
    }
  }, [query]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const cleaned = query.trim();
    if (cleaned.length < 3) { setResults([]); return; }
    const type = detectSearchType(cleaned.toUpperCase());
    if (type === 'digital_address') return;

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [nominatimRes, photonRes] = await Promise.allSettled([
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleaned)}&countrycodes=zm&limit=5&addressdetails=1`).then(r => r.json()),
          fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(cleaned)}&limit=3&lat=-15.4&lon=28.3&lang=en`).then(r => r.json()),
        ]);
        const merged: SearchResult[] = [];
        const seen = new Set<string>();

        if (nominatimRes.status === 'fulfilled') {
          for (const r of nominatimRes.value) {
            const key = `${parseFloat(r.lat).toFixed(3)},${parseFloat(r.lon).toFixed(3)}`;
            if (seen.has(key)) continue; seen.add(key);
            merged.push({ label: r.display_name?.split(',')[0] || cleaned, sublabel: r.display_name?.split(',').slice(1, 3).join(',').trim() || '', lat: parseFloat(r.lat), lng: parseFloat(r.lon), type: 'location', source: 'Nominatim' });
          }
        }
        if (photonRes.status === 'fulfilled' && photonRes.value.features) {
          for (const f of photonRes.value.features) {
            const [lng, lat] = f.geometry.coordinates;
            const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
            if (seen.has(key)) continue; seen.add(key);
            merged.push({ label: f.properties.name || cleaned, sublabel: [f.properties.city, f.properties.state, f.properties.country].filter(Boolean).join(', '), lat, lng, type: 'location', source: 'Photon' });
          }
        }
        setResults(merged);
        if (merged.length > 0) setShowDropdown(true);
      } catch (err) { console.warn('Search error:', err); }
      finally { setIsSearching(false); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handleSearch = async () => {
    const cleaned = query.trim();
    if (!cleaned) return;
    const type = detectSearchType(cleaned.toUpperCase());
    if (type === 'digital_address') {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/address/lookup?address=${encodeURIComponent(cleaned.toUpperCase())}`);
        const data = await res.json();
        const lat = data.coordinates?.lat ?? data.latitude;
        const lon = data.coordinates?.lng ?? data.coordinates?.lon ?? data.longitude;
        if (lat && lon) { addToHistory(cleaned.toUpperCase(), 'digital_address'); onGoToLocation(lat, lon); setShowDropdown(false); }
        else { setResults([{ label: 'Address not found', sublabel: 'Try a different digital address', lat: 0, lng: 0, type: 'digital_address', source: 'local' }]); setShowDropdown(true); }
      } catch (err) { console.warn('Lookup failed:', err); }
      finally { setIsSearching(false); }
    } else {
      addToHistory(cleaned, 'location');
      onSearch?.(cleaned);
      if (results.length > 0) { onGoToLocation(results[0].lat, results[0].lng); setShowDropdown(false); }
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    if (result.lat === 0 && result.lng === 0) return;
    setQuery(result.label);
    addToHistory(result.label, result.type);
    onGoToLocation(result.lat, result.lng);
    setShowDropdown(false);
    setShowQuickSearches(false);
  };

  const handleQuickSearch = async (qs: QuickSearch) => {
    setQuery(qs.query);
    setShowQuickSearches(false);
    if (qs.type === 'digital_address') {
      const res = await fetch(`/api/address/lookup?address=${encodeURIComponent(qs.query)}`);
      const data = await res.json();
      const lat = data.coordinates?.lat ?? data.latitude;
      const lon = data.coordinates?.lng ?? data.coordinates?.lon ?? data.longitude;
      if (lat && lon) onGoToLocation(lat, lon);
    } else {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(qs.query)}&countrycodes=zm&limit=1`);
        const data = await res.json();
        if (data.length > 0) onGoToLocation(parseFloat(data[0].lat), parseFloat(data[0].lon));
      } catch (_) { /* */ }
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    try { localStorage.removeItem('zambia-address-search-history'); } catch (_) { /* */ }
  };

  return (
    <div className="relative flex-1 max-w-xl" ref={dropdownRef}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchType === 'digital_address' ? (
            <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center">
              <span className="text-[10px] font-bold text-emerald-700">DA</span>
            </div>
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (!query.trim() && (searchHistory.length > 0 || QUICK_SEARCHES.length > 0)) setShowQuickSearches(true); }}
          placeholder="Search address, place, or digital code (LSA-K28-870183)..."
          className="w-full pl-10 pr-20 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
          {query && (
            <button type="button" onClick={() => { setQuery(''); setResults([]); setShowDropdown(false); setShowQuickSearches(false); }} className="p-1 hover:bg-gray-100 rounded transition-colors">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
          <button type="submit" className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-md font-medium transition-colors">Go</button>
        </div>
      </form>

      {validationHint && (
        <div className="absolute top-full left-0 mt-1 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 z-[1000]">{validationHint}</div>
      )}

      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-[1000]">
          <div className="max-h-80 overflow-y-auto">
            {results.map((r, i) => (
              <button key={`${r.lat}-${r.lng}-${i}`} className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors" onClick={() => handleSelectResult(r)}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${r.type === 'digital_address' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                    {r.type === 'digital_address' ? 'DA' : '📍'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate">{r.label}</div>
                    <div className="text-xs text-gray-400 truncate">{r.sublabel}</div>
                  </div>
                  <span className="text-[10px] text-gray-300">{r.source}</span>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => setShowDropdown(false)} className="w-full px-4 py-2 text-xs text-gray-400 hover:bg-gray-50 border-t border-gray-100">Close</button>
        </div>
      )}

      {showQuickSearches && !showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-[1000]">
          {searchHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Recent</span>
                <button onClick={clearHistory} className="text-[10px] text-gray-400 hover:text-gray-600">Clear</button>
              </div>
              {searchHistory.slice(0, 5).map((h, i) => (
                <button key={`history-${i}`} className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  onClick={() => { setQuery(h.query); setShowQuickSearches(false); if (h.type === 'location') onSearch?.(h.query); }}>
                  <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-sm text-gray-600">{h.query}</span>
                  {h.type === 'digital_address' && <span className="ml-auto text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">DA</span>}
                </button>
              ))}
            </div>
          )}
          <div>
            <div className="px-4 py-2 border-b border-gray-100"><span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Quick Search</span></div>
            <div className="grid grid-cols-2 gap-1 p-2">
              {QUICK_SEARCHES.map((qs, i) => (
                <button key={`qs-${i}`} className="px-3 py-2 text-left hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors" onClick={() => handleQuickSearch(qs)}>
                  <span className="text-base">{qs.icon}</span>
                  <span className="text-xs text-gray-600">{qs.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
