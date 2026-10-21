'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Compass } from 'lucide-react';

// Leaflet divIcons take raw HTML, so the lucide glyphs (Building2, MapPin, Truck)
// are inlined as SVG markup here to keep marker icons consistent with the UI.
const svgIcon = (paths, size = 16) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const HUB_ICON_SVG = svgIcon(
  '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>'
);
const DEST_ICON_SVG = svgIcon(
  '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>'
);
const VEHICLE_ICON_SVG = svgIcon(
  '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  14
);

export default function InteractiveRouteMap({ 
  hubLat, 
  hubLng, 
  destLat, 
  destLng, 
  coordinates = [], 
  steps = [],
  vehicleName = 'Truck',
  distanceKm = 0,
  driveMinutes = 0
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter = [hubLat, hubLng];
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    // Sleek, high-contrast map tiles (CartoDB Voyager: clean roads like Google Maps & Uber)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Zoom control on top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Custom Start (Hub) Marker
    const hubIcon = L.divIcon({
      className: 'custom-hub-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex h-8 w-8 rounded-full bg-brand opacity-30 animate-ping"></span>
          <div class="h-8 w-8 rounded-full bg-brand border-2 border-white shadow-lg flex items-center justify-center text-white">
            ${HUB_ICON_SVG}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Custom Destination Marker
    const destIcon = L.divIcon({
      className: 'custom-dest-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="h-8 w-8 rounded-full bg-slate-900 border-2 border-white shadow-lg flex items-center justify-center text-white">
            ${DEST_ICON_SVG}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const hubMarker = L.marker([hubLat, hubLng], { icon: hubIcon })
      .addTo(map)
      .bindPopup('<b class="text-sm">Vijaynagar Hub</b><br/><span class="text-xs text-slate-500">Pick-up Location</span>');

    const destMarker = L.marker([destLat, destLng], { icon: destIcon })
      .addTo(map)
      .bindPopup('<b class="text-sm">Customer Location</b><br/><span class="text-xs text-slate-500">Delivery Destination</span>');

    // Route coordinates: if provided, draw turn-by-turn road polyline
    const routePoints = (coordinates && coordinates.length > 0)
      ? coordinates
      : [[hubLat, hubLng], [destLat, destLng]];

    // Background casing line for road outline effect (like Uber/Google Maps)
    const casingPolyline = L.polyline(routePoints, {
      color: '#7A1A05',
      weight: 8,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Foreground active glowing brand road line
    const activePolyline = L.polyline(routePoints, {
      color: '#C02806',
      weight: 5,
      opacity: 1,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Add a midway vehicle marker along the route
    if (coordinates.length > 2) {
      const midIdx = Math.floor(coordinates.length / 2);
      const midPoint = coordinates[midIdx];

      const vehicleIcon = L.divIcon({
        className: 'custom-vehicle-icon',
        html: `
          <div class="flex items-center justify-center h-7 w-7 rounded-full bg-brand-strong text-white shadow-md border border-white">
            ${VEHICLE_ICON_SVG}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker(midPoint, { icon: vehicleIcon })
        .addTo(map)
        .bindPopup(`<b>${vehicleName}</b><br/>In route: ${distanceKm} km (${driveMinutes} min drive)`);
    }

    // Auto-fit bounds so user sees full start-to-end trip with padding
    const group = L.featureGroup([hubMarker, destMarker, activePolyline]);
    map.fitBounds(group.getBounds().pad(0.15));

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [hubLat, hubLng, destLat, destLng, coordinates, vehicleName, distanceKm, driveMinutes]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds(
      (coordinates && coordinates.length > 0) ? coordinates : [[hubLat, hubLng], [destLat, destLng]]
    );
    mapInstanceRef.current.fitBounds(bounds.pad(0.15));
  };

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-mist dark:border-line shadow-md">
        <div 
          ref={mapContainerRef} 
          className="w-full h-80 sm:h-96 z-0 bg-slate-150 dark:bg-ink-800" 
        />

        {/* Floating Uber/Rapido Style Live Trip Overlay */}
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 dark:bg-black/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-mist dark:border-line shadow-lg flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
              Road Route
            </span>
          </div>
          <span className="text-black/30 dark:text-white/30">•</span>
          <span className="text-xs font-bold text-brand dark:text-mist">
            {distanceKm} km
          </span>
          <span className="text-black/30 dark:text-white/30">•</span>
          <span className="text-xs font-semibold text-black/70 dark:text-white/70">
            ~{driveMinutes} min drive
          </span>
        </div>

        {/* Recenter Button */}
        <button
          type="button"
          onClick={handleRecenter}
          className="absolute bottom-3 right-3 z-[1000] bg-white dark:bg-black hover:bg-slate-50 dark:hover:bg-slate-900 text-black dark:text-white p-2.5 rounded-xl border border-mist dark:border-line shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 text-xs font-bold"
          title="Recenter route"
        >
          <Compass className="h-4 w-4 text-brand" />
          <span>Fit Route</span>
        </button>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-black/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-mist dark:border-line text-[11px] font-medium flex items-center gap-2.5 shadow-sm">
          <span className="flex items-center gap-1 text-brand">
            <span className="h-2.5 w-2.5 rounded-full bg-brand inline-block border border-white" />
            Hub (Start)
          </span>
          <span className="text-black/30 dark:text-white/30">→</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 inline-block border border-white" />
            Customer (End)
          </span>
        </div>
      </div>

      {/* Turn-by-Turn Navigation Steps (Uber/Rapido style direction preview) */}
      {steps && steps.length > 0 && (
        <div className="bg-white dark:bg-black rounded-2xl border border-mist dark:border-line p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand dark:text-mist flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5" />
              Direction Maneuvers &amp; Turns
            </h3>
            <span className="text-[11px] text-black/50 dark:text-white/50">
              {steps.length} key road turns
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="h-5 w-5 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-black dark:text-white truncate">{step.instruction}</p>
                  <p className="text-[10px] text-black/40 dark:text-white/40">
                    {(step.distanceMeters / 1000).toFixed(1)} km · {Math.max(1, Math.round(step.durationSeconds / 60))} min
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
