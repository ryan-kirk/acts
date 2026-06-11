import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EVENTS, LOCATIONS, JOURNEY_ROUTES, CATEGORY_COLORS, type BibleEvent } from './bible-data';

interface MapViewProps {
  onSelectEvent: (event: BibleEvent) => void;
  selectedEventId: string | null;
}

const TILE_LAYERS = {
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri, Maxar, Earthstar Geographics',
    filter: 'sepia(18%) contrast(1.08) brightness(0.86) saturate(1.1)',
  },
  terrain: {
    label: 'Terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
    filter: 'sepia(35%) contrast(1.05) brightness(0.90) saturate(0.85)',
  },
  topo: {
    label: 'Topographic',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
    filter: 'sepia(12%) contrast(1.02) brightness(0.93)',
  },
} as const;

type TileKey = keyof typeof TILE_LAYERS;

const JOURNEY_COLORS: Record<string, string> = {
  first: '#d4a843',
  second: '#7ab890',
  third: '#9a7abd',
  rome: '#c05050',
};

export function MapView({ onSelectEvent, selectedEventId }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Record<string, L.CircleMarker>>({});
  const journeyLayersRef = useRef<Record<string, L.Polyline>>({});

  const [tileKey, setTileKey] = useState<TileKey>('satellite');
  const [showJourneys, setShowJourneys] = useState<Record<string, boolean>>({
    first: true, second: true, third: true, rome: true,
  });

  const locationEventMap: Record<string, BibleEvent[]> = {};
  for (const event of EVENTS) {
    if (!locationEventMap[event.locationId]) locationEventMap[event.locationId] = [];
    locationEventMap[event.locationId].push(event);
  }

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [37.5, 26],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });
    mapRef.current = map;

    // Initial tile layer
    const layer = L.tileLayer(TILE_LAYERS.satellite.url, { maxZoom: 18 });
    layer.addTo(map);
    tileLayerRef.current = layer;

    // Apply filter to tile pane
    const tilePaneEl = map.getPane('tilePane') as HTMLElement | undefined;
    if (tilePaneEl) tilePaneEl.style.filter = TILE_LAYERS.satellite.filter;

    // Journey routes
    Object.entries(JOURNEY_ROUTES).forEach(([key, route]) => {
      const latlngs = route.locationIds
        .map((id) => LOCATIONS[id])
        .filter(Boolean)
        .map((loc) => [loc.lat, loc.lon] as [number, number]);

      const polyline = L.polyline(latlngs, {
        color: JOURNEY_COLORS[key],
        weight: 2.5,
        opacity: 0.78,
        dashArray: '8 5',
      });
      polyline.addTo(map);
      journeyLayersRef.current[key] = polyline;
    });

    // City markers
    Object.values(LOCATIONS)
      .filter((loc) => locationEventMap[loc.id])
      .forEach((loc) => {
        const events = locationEventMap[loc.id];
        const primaryCategory = events[0]?.category;
        const color = primaryCategory ? CATEGORY_COLORS[primaryCategory] : '#c9922a';

        const marker = L.circleMarker([loc.lat, loc.lon], {
          radius: 6,
          fillColor: color,
          fillOpacity: 0.9,
          color: '#100d08',
          weight: 1.5,
        });

        // Popup HTML
        const eventsHtml = events.map((ev) => `
          <div class="btp-event-item" data-id="${ev.id}" style="cursor:pointer;padding:4px 6px;background:rgba(201,146,42,0.07);border-radius:2px;border:1px solid rgba(201,146,42,0.15);margin-top:4px;">
            <div style="font-family:Cinzel,serif;font-size:10px;color:#c8b07a;line-height:1.35;">${ev.title}</div>
            <div style="font-family:JetBrains Mono,monospace;font-size:8px;color:#5a4a30;margin-top:2px;">${ev.passage} · ${ev.dateDisplay}</div>
          </div>
        `).join('');

        const popupHtml = `
          <div style="background:#1a1510;border:1px solid rgba(201,146,42,0.3);border-radius:2px;padding:10px 12px;min-width:200px;max-width:260px;margin:-10px;">
            <div style="font-family:Cinzel,serif;font-size:13px;font-weight:600;color:#e4cfa0;margin-bottom:2px;">${loc.name}</div>
            <div style="font-family:JetBrains Mono,monospace;font-size:8.5px;color:#7a6b4f;margin-bottom:6px;">${loc.region} · ${loc.lat.toFixed(2)}°N ${loc.lon.toFixed(2)}°E</div>
            <div style="font-family:Crimson Pro,Georgia,serif;font-size:11.5px;color:#9a8a65;line-height:1.55;margin-bottom:8px;">${loc.description}</div>
            <div style="border-top:1px solid rgba(201,146,42,0.15);padding-top:7px;">
              <div style="font-family:JetBrains Mono,monospace;font-size:8.5px;color:#c9922a;letter-spacing:0.08em;margin-bottom:4px;">${events.length} EVENT${events.length !== 1 ? 'S' : ''} RECORDED HERE</div>
              ${eventsHtml}
            </div>
          </div>
        `;

        const popup = L.popup({
          closeButton: false,
          className: 'btp-popup',
          maxWidth: 280,
          minWidth: 210,
          offset: [0, -4],
        }).setContent(popupHtml);

        marker.bindPopup(popup);
        marker.on('popupopen', () => {
          // Wire up event item clicks after popup DOM is inserted
          setTimeout(() => {
            document.querySelectorAll('.btp-event-item').forEach((el) => {
              el.addEventListener('click', () => {
                const id = el.getAttribute('data-id');
                const ev = EVENTS.find((e) => e.id === id);
                if (ev) onSelectEvent(ev);
                marker.closePopup();
              });
            });
          }, 0);
        });

        marker.addTo(map);
        markersRef.current[loc.id] = marker;
      });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap tile layer when tileKey changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const layer = L.tileLayer(TILE_LAYERS[tileKey].url, { maxZoom: 18 });
    layer.addTo(map);
    tileLayerRef.current = layer;
    const tilePaneEl = map.getPane('tilePane') as HTMLElement | undefined;
    if (tilePaneEl) tilePaneEl.style.filter = TILE_LAYERS[tileKey].filter;
  }, [tileKey]);

  // Toggle journey visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.entries(showJourneys).forEach(([key, visible]) => {
      const layer = journeyLayersRef.current[key];
      if (!layer) return;
      if (visible) {
        if (!map.hasLayer(layer)) layer.addTo(map);
      } else {
        if (map.hasLayer(layer)) map.removeLayer(layer);
      }
    });
  }, [showJourneys]);

  // Highlight selected marker and fly to it
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const selectedLocId = selectedEventId
      ? EVENTS.find((e) => e.id === selectedEventId)?.locationId
      : null;

    Object.entries(markersRef.current).forEach(([locId, marker]) => {
      const events = locationEventMap[locId] || [];
      const primaryCategory = events[0]?.category;
      const baseColor = primaryCategory ? CATEGORY_COLORS[primaryCategory] : '#c9922a';
      const isSelected = locId === selectedLocId;
      marker.setStyle({
        fillColor: isSelected ? '#c9922a' : baseColor,
        fillOpacity: isSelected ? 1 : 0.9,
        color: isSelected ? '#e4cfa0' : '#100d08',
        weight: isSelected ? 2.5 : 1.5,
        radius: isSelected ? 9 : 6,
      } as any);
    });

    if (selectedLocId) {
      const loc = LOCATIONS[selectedLocId];
      if (loc) map.flyTo([loc.lat, loc.lon], Math.max(map.getZoom(), 6), { duration: 1.2 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId]);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div
        className="flex flex-wrap items-center gap-3 px-4 py-2 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(201,146,42,0.2)', background: '#15110c', zIndex: 10, position: 'relative' }}
      >
        {/* Tile switcher */}
        <div className="flex items-center gap-1">
          {(Object.keys(TILE_LAYERS) as TileKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setTileKey(key)}
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '9px',
                letterSpacing: '0.07em',
                padding: '3px 9px',
                borderRadius: 2,
                color: tileKey === key ? '#c9922a' : '#5a4a30',
                background: tileKey === key ? 'rgba(201,146,42,0.12)' : 'transparent',
                border: tileKey === key ? '1px solid rgba(201,146,42,0.35)' : '1px solid rgba(201,146,42,0.1)',
                cursor: 'pointer',
              }}
            >
              {TILE_LAYERS[key].label.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 16, background: 'rgba(201,146,42,0.2)' }} />

        {/* Journey toggles */}
        {Object.entries(JOURNEY_ROUTES).map(([key, route]) => (
          <button
            key={key}
            onClick={() => setShowJourneys((p) => ({ ...p, [key]: !p[key] }))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '8.5px',
              padding: '3px 9px',
              borderRadius: 2,
              color: showJourneys[key] ? JOURNEY_COLORS[key] : '#5a4a30',
              border: `1px solid ${showJourneys[key] ? JOURNEY_COLORS[key] + '55' : 'rgba(201,146,42,0.1)'}`,
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <span style={{
              display: 'inline-block',
              width: 8, height: 8, borderRadius: 2,
              background: showJourneys[key] ? JOURNEY_COLORS[key] : 'transparent',
              border: `1.5px solid ${JOURNEY_COLORS[key]}`,
              flexShrink: 0,
            }} />
            {route.label.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* Map container */}
      <div className="flex-1 relative" style={{ zIndex: 0 }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 12, left: 12, zIndex: 500,
          background: 'rgba(16,13,8,0.85)', border: '1px solid rgba(201,146,42,0.2)',
          borderRadius: 2, padding: '8px 12px',
          fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: '#7a6b4f',
        }}>
          <div style={{ color: '#c9922a', marginBottom: 5, letterSpacing: '0.08em' }}>CATEGORIES</div>
          {[
            { color: '#4a8a6a', label: 'Founding' },
            { color: '#c9922a', label: 'Journey / Conversion' },
            { color: '#7a5a9a', label: 'Discourse' },
            { color: '#7a9a8a', label: 'Miracle' },
            { color: '#8a2020', label: 'Martyrdom' },
            { color: '#7a3528', label: 'Arrest' },
            { color: '#4a6a8a', label: 'Shipwreck' },
          ].map((c) => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.color, display: 'inline-block', flexShrink: 0 }} />
              {c.label}
            </div>
          ))}
        </div>

        {/* Attribution */}
        <div style={{
          position: 'absolute', bottom: 8, right: 8, zIndex: 500,
          background: 'rgba(16,13,8,0.7)', borderRadius: 2, padding: '2px 6px',
          fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: '#5a4a30',
        }}>
          {TILE_LAYERS[tileKey].attribution}
        </div>
      </div>

      <style>{`
        .btp-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 2px !important;
        }
        .btp-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        .btp-popup .leaflet-popup-tip-container {
          display: none !important;
        }
        .leaflet-container { cursor: crosshair; background: #0a1520; }
      `}</style>
    </div>
  );
}
