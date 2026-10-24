import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/server';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// ─── Hub ─────────────────────────────────────────────────────────────────────
const HUB = {
  name: 'Vijaynagar Industrial Area Hub',
  lat: 26.8882463,
  lng: 75.7858387,
};

// ─── Vehicle fleet ────────────────────────────────────────────────────────────
const FLEET = [
  { id: 'mini',   name: 'Mini truck (Tata Ace)',      capacityKg: 750,   baseFare: 400,  perKm: 18, loadMin: 10, unloadMin: 5  },
  { id: 'lcv',    name: 'Light truck (Tata 407)',     capacityKg: 2500,  baseFare: 700,  perKm: 22, loadMin: 15, unloadMin: 8  },
  { id: 'medium', name: 'Medium truck (10-wheeler)',  capacityKg: 9000,  baseFare: 1500, perKm: 32, loadMin: 25, unloadMin: 13 },
  { id: 'heavy',  name: 'Heavy trailer (14-wheeler)', capacityKg: 25000, baseFare: 3200, perKm: 45, loadMin: 40, unloadMin: 20 },
];

// Trucks are slower than Google's car-based routing — apply a multiplier to
// the returned duration so the estimate reflects real delivery times.
const SPEED_MULTIPLIER = { mini: 1.0, lcv: 1.1, medium: 1.3, heavy: 1.5 };

// ─── Materials ────────────────────────────────────────────────────────────────
export const MATERIALS = [
  { id: 'cement',    name: 'Cement',              unit: 'bag',          kgPerUnit: 50   },
  { id: 'bricks',    name: 'Bricks',              unit: 'bundle of 100', kgPerUnit: 300  },
  { id: 'rebar',     name: 'Steel Rebar',         unit: 'bundle',       kgPerUnit: 500  },
  { id: 'sand',      name: 'Sand & Aggregate',    unit: 'ton',          kgPerUnit: 1000 },
  { id: 'tiles',     name: 'Tiles / Blocks',      unit: 'box',          kgPerUnit: 20   },
  { id: 'other',     name: 'Other',               unit: 'kg',           kgPerUnit: 1    },
];

// ─── In-memory cache (hub→destination, 5-minute TTL) ────────────────────────
const routeCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function cacheKey(destLat, destLng) {
  // round to ~100 m precision for cache bucketing
  return `${destLat.toFixed(3)},${destLng.toFixed(3)}`;
}

const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY || 
                           process.env.EXPO_PUBLIC_LOCATIONIQ_API_KEY || 
                           process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY;

// ─── Google helpers with LocationIQ fallback ──────────────────────────────────
async function geocodeWithLocationIQ(address) {
  if (!LOCATIONIQ_API_KEY) {
    throw new Error('Neither Google Maps Billing nor LocationIQ API Key is available for Geocoding.');
  }
  const url = `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(address)}&format=json&limit=1`;
  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok || !Array.isArray(data) || !data[0]) {
    throw new Error('Address not found via geocoding service.');
  }
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

async function geocode(address) {
  if (!GOOGLE_MAPS_API_KEY) {
    return await geocodeWithLocationIQ(address);
  }
  try {
    const params = new URLSearchParams({ address, key: GOOGLE_MAPS_API_KEY });
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    if (data.status === 'OK' && data.results?.[0]) {
      return data.results[0].geometry.location; // { lat, lng }
    }
    // If Google denies request (e.g. billing disabled), fall back to LocationIQ
    console.warn(`Google Geocoding failed (${data.status}: ${data.error_message}), trying LocationIQ fallback...`);
    return await geocodeWithLocationIQ(address);
  } catch (err) {
    console.warn('Google Geocode error, trying LocationIQ fallback...', err.message);
    return await geocodeWithLocationIQ(address);
  }
}

async function getRoadRouteWithLocationIQ(destLat, destLng, speedMultiplier) {
  // LocationIQ / OSRM Directions API with full geometry and turn steps
  const coords = `${HUB.lng},${HUB.lat};${destLng},${destLat}`;
  const url = LOCATIONIQ_API_KEY 
    ? `https://us1.locationiq.com/v1/directions/driving/${coords}?key=${LOCATIONIQ_API_KEY}&geometries=geojson&overview=full&steps=true`
    : `https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full&steps=true`;

  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();

  if (!res.ok || data.code !== 'Ok' || !data.routes?.[0]) {
    throw new Error(`Road route calculation failed: ${data.message || 'No route found'}`);
  }

  const route = data.routes[0];
  const distanceKm = route.distance / 1000;
  const baseMinutes = route.duration / 60;

  // Convert GeoJSON [lon, lat] points to [lat, lon] for Leaflet
  const coordinates = (route.geometry?.coordinates || []).map(([lon, lat]) => [lat, lon]);

  // Extract turn-by-turn instructions
  const steps = (route.legs?.[0]?.steps || [])
    .map((s) => ({
      instruction: s.maneuver?.instruction || `${s.maneuver?.type || 'Drive'} on ${s.name || 'road'}`,
      distanceMeters: Math.round(s.distance),
      durationSeconds: Math.round(s.duration),
    }))
    .filter((s) => s.distanceMeters > 0);

  return { 
    distanceKm, 
    driveMinutes: baseMinutes * speedMultiplier,
    coordinates,
    steps: steps.slice(0, 8), // top key steps
  };
}

async function getRoadRoute(destLat, destLng, speedMultiplier) {
  const key = cacheKey(destLat, destLng);
  const cached = routeCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return { ...cached.data, driveMinutes: cached.data.driveMinutes * speedMultiplier };
  }

  if (!GOOGLE_MAPS_API_KEY) {
    const route = await getRoadRouteWithLocationIQ(destLat, destLng, speedMultiplier);
    routeCache.set(key, { ts: Date.now(), data: { distanceKm: route.distanceKm, driveMinutes: route.driveMinutes / speedMultiplier } });
    return route;
  }

  try {
    const params = new URLSearchParams({
      origins: `${HUB.lat},${HUB.lng}`,
      destinations: `${destLat},${destLng}`,
      mode: 'driving',
      departure_time: 'now',
      key: GOOGLE_MAPS_API_KEY,
    });

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?${params}`,
      { cache: 'no-store' }
    );
    const data = await res.json();

    if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
      const el = data.rows[0].elements[0];
      const distanceKm = el.distance.value / 1000;
      const baseMinutes = (el.duration_in_traffic?.value ?? el.duration.value) / 60;
      routeCache.set(key, { ts: Date.now(), data: { distanceKm, driveMinutes: baseMinutes } });
      return { distanceKm, driveMinutes: baseMinutes * speedMultiplier };
    }

    console.warn(`Google Distance Matrix issue (${data.status}: ${data.error_message}), falling back to LocationIQ/OSRM road routing...`);
    const fallback = await getRoadRouteWithLocationIQ(destLat, destLng, speedMultiplier);
    routeCache.set(key, { ts: Date.now(), data: { distanceKm: fallback.distanceKm, driveMinutes: fallback.driveMinutes / speedMultiplier } });
    return fallback;
  } catch (err) {
    console.warn('Google Distance Matrix error, falling back to LocationIQ/OSRM...', err.message);
    const fallback = await getRoadRouteWithLocationIQ(destLat, destLng, speedMultiplier);
    routeCache.set(key, { ts: Date.now(), data: { distanceKm: fallback.distanceKm, driveMinutes: fallback.driveMinutes / speedMultiplier } });
    return fallback;
  }
}

// ─── Business logic ───────────────────────────────────────────────────────────
function pickVehicle(weightKg, restrictHeavy) {
  const pool = restrictHeavy ? FLEET.filter((v) => v.id !== 'heavy') : FLEET;
  const fit = pool.find((v) => weightKg <= v.capacityKg);
  if (fit) return { vehicle: fit, trips: 1 };
  const biggest = pool[pool.length - 1];
  return { vehicle: biggest, trips: Math.ceil(weightKg / biggest.capacityKg) };
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request) {
  const denied = await requireApiAuth(request);
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { address, materialId, quantity, restrictHeavy = false } = body;

  if (!address?.trim()) {
    return NextResponse.json({ error: 'Delivery address is required.' }, { status: 400 });
  }
  if (!materialId) {
    return NextResponse.json({ error: 'Material is required.' }, { status: 400 });
  }
  const qty = Number(quantity);
  if (!qty || qty <= 0) {
    return NextResponse.json({ error: 'Quantity must be a positive number.' }, { status: 400 });
  }

  const material = MATERIALS.find((m) => m.id === materialId);
  if (!material) {
    return NextResponse.json({ error: 'Unknown material.' }, { status: 400 });
  }

  const weightKg = material.kgPerUnit * qty;
  const { vehicle, trips } = pickVehicle(weightKg, restrictHeavy);
  const speedMultiplier = SPEED_MULTIPLIER[vehicle.id] ?? 1.0;

  let destCoords;
  try {
    destCoords = await geocode(address.trim());
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 422 });
  }

  let routeData;
  try {
    routeData = await getRoadRoute(destCoords.lat, destCoords.lng, speedMultiplier);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }

  const { distanceKm, driveMinutes } = routeData;
  const HUB_PROCESSING_MIN = 15;
  const perTripMinutes = vehicle.loadMin + driveMinutes + vehicle.unloadMin;
  const totalMinutes = HUB_PROCESSING_MIN + perTripMinutes * trips;
  const totalCost = (vehicle.baseFare + vehicle.perKm * distanceKm) * trips;

  return NextResponse.json({
    hub: HUB.name,
    address: address.trim(),
    material: material.name,
    unit: material.unit,
    quantity: qty,
    weightKg,
    vehicle: vehicle.name,
    vehicleId: vehicle.id,
    trips,
    distanceKm: Math.round(distanceKm * 10) / 10,
    driveMinutes: Math.round(driveMinutes),
    hubProcessingMin: HUB_PROCESSING_MIN,
    loadMin: vehicle.loadMin,
    unloadMin: vehicle.unloadMin,
    perTripMinutes: Math.round(perTripMinutes),
    totalMinutes: Math.round(totalMinutes),
    totalCost: Math.round(totalCost),
    destLat: destCoords.lat,
    destLng: destCoords.lng,
    hubLat: HUB.lat,
    hubLng: HUB.lng,
    coordinates: routeData.coordinates || [],
    steps: routeData.steps || [],
  });
}
