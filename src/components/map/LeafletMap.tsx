'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';

interface SelectedLocation {
  lat: number;
  lng: number;
  digitalAddress: string;
  province: string;
  postalArea: string;
  sectorCode: string;
}

interface POI {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  digital_code: string;
}

interface Area {
  id: string;
  name: string;
  bounds: string | object;
  color: string;
  area_type: string;
}

interface MapProps {
  onLocationSelect: (location: SelectedLocation) => void;
  centerLocation?: { lat: number; lng: number } | null;
  directionsDestination?: { lat: number; lng: number } | null;
  onDirectionsCalculated?: () => void;
  onDirectionsCleared?: () => void;
  searchQuery?: string;
  mapTheme?: string;
  pois?: POI[];
  areas?: Area[];
  showPois?: boolean;
  showAreas?: boolean;
  measurementMode?: 'off' | 'distance' | 'area';
  onMeasurementResult?: (result: { type: 'distance' | 'area'; value: number; unit: string }) => void;
}

const DEFAULT_CENTER: [number, number] = [-13.5, 28.5];
const DEFAULT_ZOOM = 6;
const ZAMBIA_CENTER: [number, number] = [-15.4167, 28.2833];

const TILE_LAYERS: Record<string, { url: string; attribution: string; subdomains?: string; maxZoom?: number }> = {
  roadmap: {
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
  terrain: {
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OSM &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  },
  watercolor: {
    url: 'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg',
    attribution: '&copy; Stadia Maps &copy; Stamen',
    maxZoom: 16,
  },
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap',
    maxZoom: 17,
  },
};

const POI_EMOJIS: Record<string, string> = {
  hospital: '🏥', school: '🏫', bank: '🏦', restaurant: '🍽️', hotel: '🏨',
  government: '🏛️', church: '⛪', market: '🛒', event: '🎪', transport: '🚌',
  park: '🌳', university: '🎓', police: '👮', fire_station: '🚒', post_office: '📮',
  atm: '💳', general: '📍',
};

const POI_COLORS: Record<string, string> = {
  hospital: '#EF4444', school: '#F59E0B', bank: '#3B82F6', restaurant: '#10B981',
  hotel: '#8B5CF6', government: '#6366F1', church: '#EC4899', market: '#F97316',
  event: '#14B8A6', transport: '#0EA5E9', park: '#22C55E', university: '#A855F7',
  police: '#3B82F6', fire_station: '#EF4444', post_office: '#F59E0B', atm: '#6366F1',
  general: '#6B7280',
};

export default function LeafletMap({
  onLocationSelect,
  centerLocation,
  directionsDestination,
  onDirectionsCalculated,
  onDirectionsCleared,
  mapTheme = 'roadmap',
  pois = [],
  areas = [],
  showPois = true,
  showAreas = true,
  measurementMode = 'off',
  onMeasurementResult,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const clickMarkerRef = useRef<L.CircleMarker | null>(null);
  const popupRef = useRef<L.Popup | null>(null);
  const poiLayerRef = useRef<L.LayerGroup | null>(null);
  const areaLayerRef = useRef<L.LayerGroup | null>(null);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.FeatureGroup | null>(null);
  const measurementLayerRef = useRef<L.FeatureGroup | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const lastClickTimeRef = useRef<number>(0);
  const isAnimatingRef = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [measurementPoints, setMeasurementPoints] = useState<[number, number][]>([]);

  const safeSetView = useCallback((center: [number, number], zoom: number, animate = false) => {
    const map = mapRef.current;
    if (!map || isAnimatingRef.current) return;
    const [lat, lng] = center;
    if (!isFinite(lat) || !isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
    try {
      isAnimatingRef.current = true;
      if (animate) {
        map.flyTo(center, zoom, { duration: 1.2 });
        setTimeout(() => { isAnimatingRef.current = false; }, 1300);
      } else {
        map.setView(center, zoom);
        isAnimatingRef.current = false;
      }
    } catch (err) {
      isAnimatingRef.current = false;
    }
  }, []);

  // ─── Map Click → Generate Digital Address ───────────────────────────

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    lastClickTimeRef.current = Date.now();
    if (measurementMode !== 'off') return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/postcode?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (data.error) { console.error(data.error); return; }

      const map = mapRef.current;
      if (!map) return;

      // Green marker at clicked location
      if (clickMarkerRef.current) {
        clickMarkerRef.current.setLatLng([lat, lng]);
      } else {
        clickMarkerRef.current = L.circleMarker([lat, lng], {
          radius: 10, fillColor: '#059669', color: '#ffffff', weight: 3, opacity: 1, fillOpacity: 0.9,
        }).addTo(map);
      }

      // Popup showing digital address prominently
      if (!popupRef.current) {
        popupRef.current = L.popup({ closeButton: true, autoPan: true, maxWidth: 280 });
      }
      popupRef.current
        .setLatLng([lat, lng])
        .setContent(`
          <div style="font-family:system-ui;min-width:240px;padding:8px 4px">
            <div style="font-size:10px;color:#059669;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;margin-bottom:8px">Digital Address</div>
            <div style="font-size:24px;font-weight:800;font-family:ui-monospace,monospace;color:#064e3b;margin-bottom:12px;letter-spacing:2px;background:#ecfdf5;padding:8px 12px;border-radius:8px;text-align:center;border:1px solid #d1fae5">${data.digitalAddress}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
              <div><span style="color:#9ca3af;display:block;font-size:10px;margin-bottom:2px">Province</span><span style="color:#1e293b;font-weight:600">${data.provinceName || 'Zambia'}</span></div>
              <div><span style="color:#9ca3af;display:block;font-size:10px;margin-bottom:2px">Sector</span><span style="color:#1e293b;font-weight:600">${data.sectorCode}</span></div>
              <div><span style="color:#9ca3af;display:block;font-size:10px;margin-bottom:2px">Latitude</span><span style="color:#1e293b;font-weight:500">${lat.toFixed(6)}</span></div>
              <div><span style="color:#9ca3af;display:block;font-size:10px;margin-bottom:2px">Longitude</span><span style="color:#1e293b;font-weight:500">${lng.toFixed(6)}</span></div>
            </div>
          </div>
        `)
        .openOn(map);

      onLocationSelect({
        lat, lng,
        digitalAddress: data.digitalAddress,
        province: data.provinceName,
        postalArea: data.postalArea,
        sectorCode: data.sectorCode,
      });
    } catch (err) {
      console.error('Failed to generate address:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onLocationSelect, measurementMode]);

  // ─── Measurement Click ──────────────────────────────────────────────

  const handleMeasurementClick = useCallback((lat: number, lng: number) => {
    const map = mapRef.current;
    if (!map || !measurementLayerRef.current) return;

    const newPoints = [...measurementPoints, [lat, lng] as [number, number]];
    setMeasurementPoints(newPoints);

    const marker = L.circleMarker([lat, lng], {
      radius: 6, fillColor: '#f59e0b', color: '#fff', weight: 2, fillOpacity: 1,
    });
    measurementLayerRef.current.addLayer(marker);

    if (measurementMode === 'distance' && newPoints.length >= 2) {
      const p1 = newPoints[newPoints.length - 2];
      const p2 = newPoints[newPoints.length - 1];
      measurementLayerRef.current.addLayer(
        L.polyline([p1, p2], { color: '#f59e0b', weight: 3, dashArray: '8,8' })
      );

      let totalDist = 0;
      for (let i = 1; i < newPoints.length; i++) {
        const [la1, lo1] = newPoints[i - 1];
        const [la2, lo2] = newPoints[i];
        const R = 6371;
        const dLat = (la2 - la1) * Math.PI / 180;
        const dLon = (lo2 - lo1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(la1 * Math.PI / 180) * Math.cos(la2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        totalDist += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      }

      // Show distance label on the line midpoint
      const mid: [number, number] = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
      const label = L.marker(mid, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background:#fef3c7;border:1px solid #f59e0b;color:#92400e;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;white-space:nowrap;font-family:system-ui">${totalDist.toFixed(2)} km</div>`,
          iconAnchor: [30, 10],
        }),
      });
      measurementLayerRef.current.addLayer(label);

      onMeasurementResult?.({ type: 'distance', value: totalDist, unit: 'km' });
    } else if (measurementMode === 'area' && newPoints.length >= 3) {
      measurementLayerRef.current.getLayers()
        .filter(l => l instanceof L.Polygon)
        .forEach(l => measurementLayerRef.current!.removeLayer(l));

      measurementLayerRef.current.addLayer(
        L.polygon(newPoints, { color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.15, weight: 2, dashArray: '8,8' })
      );

      let area = 0;
      const n = newPoints.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const xi = newPoints[i][1] * Math.cos(newPoints[i][0] * Math.PI / 180) * 111.32;
        const yi = newPoints[i][0] * 110.574;
        const xj = newPoints[j][1] * Math.cos(newPoints[j][0] * Math.PI / 180) * 111.32;
        const yj = newPoints[j][0] * 110.574;
        area += xi * yj - xj * yi;
      }
      area = Math.abs(area) / 2;
      onMeasurementResult?.({ type: 'area', value: area, unit: 'km²' });
    }
  }, [measurementMode, measurementPoints, onMeasurementResult]);

  // ─── Initialize Map ─────────────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, zoomControl: false, attributionControl: true,
    });

    const tileConfig = TILE_LAYERS[mapTheme] || TILE_LAYERS.roadmap;
    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      subdomains: tileConfig.subdomains || 'abc',
      maxZoom: tileConfig.maxZoom || 20,
    }).addTo(map);

    poiLayerRef.current = L.layerGroup().addTo(map);
    areaLayerRef.current = L.layerGroup().addTo(map);
    measurementLayerRef.current = L.featureGroup().addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      handleMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    const observer = new ResizeObserver(() => { map.invalidateSize(); });
    observer.observe(containerRef.current);

    return () => { observer.disconnect(); map.remove(); mapRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── GeoJSON Province/Constituency Boundaries ─────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const PROVINCE_COLORS: Record<string, string> = {
      'LUSAKA': '#22C55E', 'COPPERBELT': '#3B82F6', 'CENTRAL': '#F59E0B',
      'SOUTHERN': '#EF4444', 'EASTERN': '#8B5CF6', 'NORTHERN': '#14B8A6',
      'MUCHINGA': '#EC4899', 'WESTERN': '#F97316', 'NORTH WESTERN': '#6366F1',
      'LUAPULA': '#0EA5E9',
    };

    fetch('/geojson/zambia-provinces.geojson')
      .then(r => r.json())
      .then(geojson => {
        if (!mapRef.current) return;

        if (boundaryLayerRef.current) {
          map.removeLayer(boundaryLayerRef.current);
        }

        boundaryLayerRef.current = L.geoJSON(geojson, {
          style: (feature) => {
            const province = feature?.properties?.PR_name || '';
            const color = PROVINCE_COLORS[province] || '#22C55E';
            return {
              color,
              weight: 1.5,
              opacity: 0.6,
              fillColor: color,
              fillOpacity: 0.05,
            };
          },
          onEachFeature: (feature, layer) => {
            const props = feature.properties || {};
            const name = props.PC_name || props.PR_name || 'Unknown';
            const province = props.PR_name || '';
            const code = props.PC_code || '';
            const pop = props.PC_pop ? props.PC_pop.toLocaleString() : '';

            layer.bindTooltip(
              `<div style="font-family:system-ui;font-size:12px">
                <div style="font-weight:600;color:#1e293b">${name}</div>
                <div style="font-size:10px;color:#6b7280">${province}${code ? ` · ${code}` : ''}${pop ? ` · Pop: ${pop}` : ''}</div>
              </div>`,
              { sticky: true, direction: 'auto', className: 'boundary-tooltip' }
            );

            layer.on('mouseover', () => {
              (layer as L.Path).setStyle({ weight: 3, opacity: 0.9, fillOpacity: 0.15 });
            });
            layer.on('mouseout', () => {
              const color = PROVINCE_COLORS[province] || '#22C55E';
              (layer as L.Path).setStyle({ weight: 1.5, opacity: 0.6, fillOpacity: 0.05 });
            });

            // Forward clicks on boundaries to the map so digital address generation still works
            layer.on('click', (e: L.LeafletMouseEvent) => {
              map.fire('click', e);
            });
          },
        }).addTo(map);
      })
      .catch(err => {
        console.warn('Failed to load GeoJSON boundaries:', err);
      });

    return () => {
      if (boundaryLayerRef.current && mapRef.current) {
        try { mapRef.current.removeLayer(boundaryLayerRef.current); } catch (_) { /**/ }
        boundaryLayerRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Re-bindclick when mode changes ─────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.off('click');
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (measurementMode !== 'off') handleMeasurementClick(e.latlng.lat, e.latlng.lng);
      else handleMapClick(e.latlng.lat, e.latlng.lng);
    });
  }, [measurementMode, handleMapClick, handleMeasurementClick]);

  // Clear measurement on mode change
  useEffect(() => {
    if (measurementLayerRef.current) measurementLayerRef.current.clearLayers();
    setMeasurementPoints([]);
  }, [measurementMode]);

  // ─── Switch Tile Layer ──────────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const tileConfig = TILE_LAYERS[mapTheme] || TILE_LAYERS.roadmap;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      subdomains: tileConfig.subdomains || 'abc',
      maxZoom: tileConfig.maxZoom || 20,
    }).addTo(map);
  }, [mapTheme]);

  // ─── Center Location ───────────────────────────────────────────────

  useEffect(() => {
    if (!centerLocation || !mapRef.current) return;
    if (Date.now() - lastClickTimeRef.current < 1000) return;
    safeSetView([centerLocation.lat, centerLocation.lng], 15, true);
    setTimeout(() => { handleMapClick(centerLocation.lat, centerLocation.lng); }, 300);
  }, [centerLocation, safeSetView, handleMapClick]);

  // ─── Directions ─────────────────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !directionsDestination) return;

    const { lat, lng } = directionsDestination;

    const calculateRoute = async (origin: [number, number]) => {
      setIsCalculatingRoute(true);
      try { map.dragging.disable(); map.scrollWheelZoom.disable(); } catch (_) { /**/ }

      if (routeLayerRef.current) {
        try { map.removeLayer(routeLayerRef.current); } catch (_) { /**/ }
        routeLayerRef.current = null;
      }

      const enableMap = () => {
        try { map.dragging.enable(); map.scrollWheelZoom.enable(); } catch (_) { /**/ }
        setIsCalculatingRoute(false);
      };

      const drawFallback = () => {
        const fg = L.featureGroup().addTo(map);
        L.polyline([origin, [lat, lng]], { color: '#dc2626', weight: 3, opacity: 0.7, dashArray: '5,10' }).addTo(fg);
        L.circleMarker([lat, lng], { radius: 8, fillColor: '#dc2626', color: '#fff', weight: 2, fillOpacity: 0.9 }).addTo(fg);
        L.circleMarker(origin, { radius: 8, fillColor: '#3b82f6', color: '#fff', weight: 2, fillOpacity: 0.9 }).addTo(fg);
        routeLayerRef.current = fg;
        map.fitBounds(L.latLngBounds(origin, [lat, lng]), { padding: [50, 50] });

        // Haversine distance for fallback
        const R = 6371;
        const dLat = (lat - origin[0]) * Math.PI / 180;
        const dLon = (lng - origin[1]) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(origin[0] * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        L.popup().setLatLng([lat, lng]).setContent(`
          <div style="font-family:system-ui;padding:6px"><div style="font-weight:700;color:#1e293b;font-size:14px;margin-bottom:4px">Straight Line</div><div style="font-size:13px;color:#dc2626;font-weight:600">${dist.toFixed(1)} km (approx)</div></div>
        `).openOn(map);

        onDirectionsCalculated?.();
        enableMap();
      };

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${lng},${lat}?overview=full&geometries=geojson`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error('OSRM error');
        const data = await res.json();
        if (!data.routes?.length) throw new Error('No routes');
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
        const fg = L.featureGroup().addTo(map);
        L.polyline(coords, { color: '#059669', weight: 5, opacity: 0.8 }).addTo(fg);
        L.circleMarker([lat, lng], { radius: 8, fillColor: '#059669', color: '#fff', weight: 2, fillOpacity: 0.9 }).addTo(fg);
        L.circleMarker(origin, { radius: 8, fillColor: '#3b82f6', color: '#fff', weight: 2, fillOpacity: 0.9 }).addTo(fg);
        L.popup().setLatLng([lat, lng]).setContent(`
          <div style="font-family:system-ui;padding:6px"><div style="font-weight:700;color:#1e293b;font-size:14px;margin-bottom:4px">Route</div><div style="font-size:13px;color:#059669;font-weight:600">${(route.distance / 1000).toFixed(1)} km &middot; ${Math.round(route.duration / 60)} min</div></div>
        `).openOn(map);
        routeLayerRef.current = fg;
        map.fitBounds(fg.getBounds(), { padding: [50, 50] });
        onDirectionsCalculated?.();
        enableMap();
      } catch (_) {
        drawFallback();
      }
    };

    // Get user location then calculate route
    if (userLocation) {
      calculateRoute(userLocation);
    } else if (navigator.geolocation) {
      setIsCalculatingRoute(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(loc);
          calculateRoute(loc);
        },
        () => {
          // Geolocation denied/failed — use default Zambia center as origin
          setIsCalculatingRoute(false);
          alert('Could not get your location. Please allow location access and try again.');
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    }
  }, [directionsDestination]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── POI Markers ────────────────────────────────────────────────────

  useEffect(() => {
    if (!poiLayerRef.current) return;
    poiLayerRef.current.clearLayers();
    if (!showPois) return;
    pois.forEach(poi => {
      const emoji = POI_EMOJIS[poi.category] || POI_EMOJIS.general;
      const color = POI_COLORS[poi.category] || POI_COLORS.general;
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:34px;height:34px;background:white;border-radius:50%;border:2.5px solid ${color};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:16px;line-height:1">${emoji}</div>`,
        iconSize: [34, 34], iconAnchor: [17, 17],
      });
      const marker = L.marker([poi.latitude, poi.longitude], { icon });
      marker.bindPopup(`
        <div style="font-family:system-ui;min-width:180px;padding:4px">
          <div style="font-weight:600;font-size:14px;color:#1e293b;margin-bottom:4px">${poi.name}</div>
          <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">${poi.category}</div>
          ${poi.digital_code ? `<div style="font-family:monospace;font-size:13px;background:#ecfdf5;padding:6px 10px;border-radius:8px;color:#059669;font-weight:700;border:1px solid #d1fae5">${poi.digital_code}</div>` : ''}
        </div>
      `);
      poiLayerRef.current?.addLayer(marker);
    });
  }, [pois, showPois]);

  // ─── Area Overlays ──────────────────────────────────────────────────

  useEffect(() => {
    if (!areaLayerRef.current) return;
    areaLayerRef.current.clearLayers();
    if (!showAreas) return;
    areas.forEach(area => {
      try {
        const bounds = typeof area.bounds === 'string' ? JSON.parse(area.bounds) : area.bounds;
        let shape: L.Layer | null = null;
        if (bounds.type === 'polygon' && bounds.coordinates) {
          shape = L.polygon(bounds.coordinates.map((c: [number, number]) => [c[1], c[0]]), { color: area.color, fillColor: area.color, fillOpacity: 0.15, weight: 2 });
        } else if (bounds.type === 'circle' && bounds.center && bounds.radius) {
          shape = L.circle([bounds.center[1], bounds.center[0]], { radius: bounds.radius, color: area.color, fillColor: area.color, fillOpacity: 0.15, weight: 2 });
        } else if (bounds.north && bounds.south) {
          shape = L.rectangle([[bounds.south, bounds.west], [bounds.north, bounds.east]], { color: area.color, fillColor: area.color, fillOpacity: 0.15, weight: 2 });
        }
        if (shape) {
          (shape as L.Path).bindPopup(`<div style="font-family:system-ui;padding:4px"><div style="font-weight:600;color:#1e293b">${area.name}</div><div style="font-size:11px;color:#9ca3af;text-transform:capitalize">${area.area_type}</div></div>`);
          areaLayerRef.current?.addLayer(shape);
        }
      } catch (_) { /**/ }
    });
  }, [areas, showAreas]);

  // ─── Get Current Location ──────────────────────────────────────────

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserLocation(pos);
        const map = mapRef.current!;
        if (userLocationMarkerRef.current) map.removeLayer(userLocationMarkerRef.current);
        const icon = L.divIcon({
          html: `<div style="position:relative"><div style="width:16px;height:16px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.2);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)"></div><div style="width:32px;height:32px;background:rgba(59,130,246,0.2);border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);animation:pulse 2s infinite"></div></div>`,
          className: 'current-location-marker', iconSize: [32, 32], iconAnchor: [16, 16],
        });
        userLocationMarkerRef.current = L.marker(pos, { icon }).addTo(map).bindPopup('Your current location');
        safeSetView(pos, 14, true);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [safeSetView]);

  // ─── Clear Map ─────────────────────────────────────────────────────

  const clearMap = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    if (routeLayerRef.current) { try { map.removeLayer(routeLayerRef.current); } catch (_) { /**/ } routeLayerRef.current = null; }
    if (measurementLayerRef.current) measurementLayerRef.current.clearLayers();
    setMeasurementPoints([]);
    if (clickMarkerRef.current) { map.removeLayer(clickMarkerRef.current); clickMarkerRef.current = null; }
    map.closePopup();
    onDirectionsCleared?.();
  }, [onDirectionsCleared]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full cursor-crosshair focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-inset"
        style={{ minHeight: '400px' }}
        tabIndex={0}
        role="application"
        aria-label="Interactive map for digital addressing"
        onKeyDown={(e) => {
          const map = mapRef.current;
          if (!map) return;
          switch (e.key) {
            case 'ArrowUp': e.preventDefault(); map.panBy([0, -50]); break;
            case 'ArrowDown': e.preventDefault(); map.panBy([0, 50]); break;
            case 'ArrowLeft': e.preventDefault(); map.panBy([-50, 0]); break;
            case 'ArrowRight': e.preventDefault(); map.panBy([50, 0]); break;
            case '+': case '=': e.preventDefault(); map.zoomIn(); break;
            case '-': case '_': e.preventDefault(); map.zoomOut(); break;
            case 'Home': e.preventDefault(); safeSetView(ZAMBIA_CENTER, 6, true); break;
            case 'Escape': e.preventDefault(); (e.target as HTMLElement).blur(); break;
          }
        }}
      />

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-2">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <button onClick={() => mapRef.current?.zoomIn()} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 border-b border-gray-100 transition-colors text-gray-500 hover:text-gray-800" title="Zoom in">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v12m6-6H6" /></svg>
          </button>
          <button onClick={() => mapRef.current?.zoomOut()} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-800" title="Zoom out">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18 12H6" /></svg>
          </button>
        </div>
        <button onClick={getCurrentLocation} className="bg-white rounded-xl shadow-lg border border-gray-200 w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors" title="My Location">
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
        </button>
        <button onClick={() => safeSetView(ZAMBIA_CENTER, 6, true)} className="bg-white rounded-xl shadow-lg border border-gray-200 w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg" title="View Zambia">🇿🇲</button>
        <button onClick={clearMap} className="bg-white rounded-xl shadow-lg border border-gray-200 w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-700" title="Clear Map">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-lg px-5 py-2.5 rounded-full border border-emerald-200 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600 font-medium">Generating address...</span>
          </div>
        </div>
      )}

      {isCalculatingRoute && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <div><div className="font-semibold text-gray-900">Calculating Route</div><div className="text-sm text-gray-500">Getting your location...</div></div>
          </div>
        </div>
      )}

      {measurementMode !== 'off' && (
        <div className="absolute top-4 left-4 z-[1000] bg-amber-50 border border-amber-200 px-4 py-2 rounded-full shadow-lg">
          <span className="text-amber-700 text-sm font-medium">
            {measurementMode === 'distance' ? '📏 Click points to measure distance' : '📐 Click points to measure area'}
          </span>
        </div>
      )}
    </div>
  );
}
