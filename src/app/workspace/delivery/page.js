'use client';

import { useState } from 'react';
import posthog from 'posthog-js';
import {
  Truck, MapPin, Package, Calculator, Clock, IndianRupee,
  AlertCircle, Loader2, ChevronDown, RotateCcw, Info,
  ArrowRight, Weight, Route,
} from 'lucide-react';

// ─── Static data (mirrors server constants, used only for the form) ────────────
const MATERIALS = [
  { id: 'cement',  name: 'Cement',           unit: 'bag'          },
  { id: 'bricks',  name: 'Bricks',           unit: 'bundle of 100' },
  { id: 'rebar',   name: 'Steel Rebar',      unit: 'bundle'       },
  { id: 'sand',    name: 'Sand & Aggregate', unit: 'ton'          },
  { id: 'tiles',   name: 'Tiles / Blocks',   unit: 'box'          },
  { id: 'other',   name: 'Other',            unit: 'kg'           },
];

const HUB_LAT = 26.8882463;
const HUB_LNG = 75.7858387;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

function formatCost(n) {
  return `₹${n.toLocaleString('en-IN')}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-mist dark:border-line bg-white dark:bg-black p-5 shadow-sm">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-1 ${accent}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <span className="text-xs font-semibold text-brand dark:text-mist uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-extrabold text-black dark:text-white leading-tight">{value}</span>
      {sub && <span className="text-xs text-black/50 dark:text-white/50">{sub}</span>}
    </div>
  );
}

function TimelineStep({ label, minutes, isLast }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center shrink-0">
        <div className="h-3 w-3 rounded-full bg-brand border-2 border-mist dark:border-line mt-0.5" />
        {!isLast && <div className="w-0.5 flex-1 bg-mist dark:bg-brand/30 min-h-[24px]" />}
      </div>
      <div className="pb-5">
        <p className="text-sm font-semibold text-black dark:text-white leading-snug">{label}</p>
        <p className="text-xs text-brand dark:text-mist font-bold mt-0.5">{formatMinutes(minutes)}</p>
      </div>
    </div>
  );
}

import dynamic from 'next/dynamic';
import PageHeader from '@/components/PageHeader';

const InteractiveRouteMap = dynamic(
  () => import('@/components/delivery/InteractiveRouteMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 sm:h-96 rounded-2xl bg-mist/20 dark:bg-brand/10 flex flex-col items-center justify-center gap-2 border border-mist dark:border-line">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
        <span className="text-xs font-semibold text-black/50 dark:text-white/50">Loading live road map…</span>
      </div>
    ),
  }
);

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DeliveryEstimatorPage() {
  const [address, setAddress] = useState('');
  const [materialId, setMaterialId] = useState('cement');
  const [quantity, setQuantity] = useState('');
  const [restrictHeavy, setRestrictHeavy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const selectedMaterial = MATERIALS.find((m) => m.id === materialId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim() || !quantity) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/delivery-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim(), materialId, quantity: Number(quantity), restrictHeavy }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Estimation failed. Please try again.');
      if (process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
        posthog.capture('delivery_estimate_calculated', {
          material_id: materialId,
          quantity: Number(quantity),
          restrict_heavy: restrictHeavy,
          trip_count: data.trips,
        });
      }
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setAddress('');
    setQuantity('');
    setRestrictHeavy(false);
    setMaterialId('cement');
  };

  return (
    <div className="flex-1 px-4 py-5 sm:p-6 lg:p-8 space-y-5 lg:space-y-6 max-w-5xl mx-auto w-full">
      <PageHeader
        title="Delivery Estimator"
        description="Get real road distance, drive time & delivery cost from the hub to your customer."
        actions={
          result && (
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-ink-800 border border-mist dark:border-line text-brand text-sm font-semibold hover:bg-mist/25 dark:hover:bg-ink-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>New Estimate</span>
            </button>
          )
        }
      />

      {/* Hub pill */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-mist/40 dark:bg-brand/10 border border-mist dark:border-line text-sm">
        <MapPin className="h-4 w-4 text-brand shrink-0" />
        <span className="font-semibold text-black dark:text-white">Hub:</span>
        <span className="text-black/60 dark:text-white/60">Vijaynagar Industrial Area, Jaipur</span>
      </div>

      {/* Form */}
      {!result && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-black rounded-2xl border border-mist dark:border-line p-6 shadow-sm space-y-5">
          {/* Delivery address */}
          <div className="space-y-1.5">
            <label htmlFor="delivery-address" className="text-sm font-semibold text-black dark:text-white flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand" />
              Customer Delivery Address
            </label>
            <input
              id="delivery-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Vaishali Nagar, Jaipur, Rajasthan"
              required
              className="w-full px-4 py-3 rounded-xl border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
            />
          </div>

          {/* Material + Quantity row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Material dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="material-select" className="text-sm font-semibold text-black dark:text-white flex items-center gap-1.5">
                <Package className="h-4 w-4 text-brand" />
                Material
              </label>
              <div className="relative">
                <select
                  id="material-select"
                  value={materialId}
                  onChange={(e) => setMaterialId(e.target.value)}
                  className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                >
                  {MATERIALS.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand pointer-events-none" />
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label htmlFor="quantity-input" className="text-sm font-semibold text-black dark:text-white flex items-center gap-1.5">
                <Weight className="h-4 w-4 text-brand" />
                Quantity
                {selectedMaterial && (
                  <span className="ml-1 text-xs font-normal text-black/40 dark:text-white/40">
                    ({selectedMaterial.unit})
                  </span>
                )}
              </label>
              <input
                id="quantity-input"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 10"
                required
                className="w-full px-4 py-3 rounded-xl border border-mist dark:border-line bg-white dark:bg-black text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              />
            </div>
          </div>

          {/* Restrict heavy vehicle */}
          <label
            htmlFor="restrict-heavy"
            className="flex items-start gap-3 cursor-pointer p-3.5 rounded-xl border border-mist dark:border-line hover:bg-mist/10 transition-colors"
          >
            <input
              id="restrict-heavy"
              type="checkbox"
              checked={restrictHeavy}
              onChange={(e) => setRestrictHeavy(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-brand"
            />
            <div>
              <p className="text-sm font-semibold text-black dark:text-white leading-snug">
                Restrict heavy trailer (14-wheeler)
              </p>
              <p className="text-xs text-black/50 dark:text-white/40 mt-0.5">
                Check this for old-city areas, narrow lanes, or zones with entry restrictions.
              </p>
            </div>
          </label>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-mist/20 dark:bg-brand/10 border border-mist dark:border-line text-black dark:text-white">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-brand" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !address.trim() || !quantity}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand hover:bg-brand-strong disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow-sm transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Calculating via Google Maps…
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4" />
                Calculate Delivery
              </>
            )}
          </button>
        </form>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">

          {/* Map */}
          <InteractiveRouteMap
            hubLat={result.hubLat}
            hubLng={result.hubLng}
            destLat={result.destLat}
            destLng={result.destLng}
            coordinates={result.coordinates || []}
            steps={result.steps || []}
            vehicleName={result.vehicle}
            distanceKm={result.distanceKm}
            driveMinutes={result.driveMinutes}
          />

          {/* Address + route summary */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 font-semibold text-black dark:text-white">
              <MapPin className="h-4 w-4 text-brand shrink-0" />
              <span className="text-black/50 dark:text-white/50">Vijaynagar Hub</span>
            </div>
            <ArrowRight className="h-4 w-4 text-brand hidden sm:block shrink-0" />
            <div className="flex items-center gap-1.5 sm:ml-0 ml-6 text-black dark:text-white font-medium truncate">
              <span>{result.address}</span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={Route}
              label="Distance"
              value={`${result.distanceKm} km`}
              sub="Real road distance"
              accent="bg-brand"
            />
            <StatCard
              icon={Clock}
              label="Total Time"
              value={formatMinutes(result.totalMinutes)}
              sub={`${result.trips > 1 ? result.trips + ' trips' : '1 trip'}`}
              accent="bg-brand"
            />
            <StatCard
              icon={Truck}
              label="Vehicle"
              value={result.trips > 1 ? `×${result.trips}` : '1 trip'}
              sub={result.vehicle}
              accent="bg-brand"
            />
            <StatCard
              icon={IndianRupee}
              label="Total Cost"
              value={formatCost(result.totalCost)}
              sub="All trips incl."
              accent="bg-brand"
            />
          </div>

          {/* Two-column detail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Timeline breakdown */}
            <div className="bg-white dark:bg-black rounded-2xl border border-mist dark:border-line p-6 shadow-sm">
              <h2 className="text-sm font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand" />
                Time Breakdown
              </h2>
              <TimelineStep label="Hub processing &amp; order prep" minutes={result.hubProcessingMin} />
              <TimelineStep label={`Load at hub (${result.vehicle})`} minutes={result.loadMin} />
              <TimelineStep label="Drive to customer" minutes={result.driveMinutes} />
              <TimelineStep
                label={`Unload at destination${result.trips > 1 ? ` × ${result.trips} trips` : ''}`}
                minutes={result.unloadMin * result.trips}
              />
              {result.trips > 1 && (
                <TimelineStep
                  label={`Return + reload (${result.trips - 1} extra trips)`}
                  minutes={(result.loadMin + result.driveMinutes) * (result.trips - 1)}
                />
              )}
              <div className="mt-2 pt-3 border-t border-mist dark:border-line flex items-center justify-between">
                <span className="text-xs font-bold text-black/50 dark:text-white/40 uppercase tracking-wider">Total estimated time</span>
                <span className="text-sm font-extrabold text-brand">{formatMinutes(result.totalMinutes)}</span>
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="bg-white dark:bg-black rounded-2xl border border-mist dark:border-line p-6 shadow-sm">
              <h2 className="text-sm font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-brand" />
                Cost Breakdown
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-black/60 dark:text-white/50">Material</span>
                  <span className="font-semibold text-black dark:text-white">{result.material} × {result.quantity} {result.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/60 dark:text-white/50">Total weight</span>
                  <span className="font-semibold text-black dark:text-white">{result.weightKg.toLocaleString('en-IN')} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/60 dark:text-white/50">Vehicle</span>
                  <span className="font-semibold text-black dark:text-white">{result.vehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/60 dark:text-white/50">Trips required</span>
                  <span className="font-semibold text-black dark:text-white">{result.trips}</span>
                </div>

                <div className="border-t border-mist dark:border-line pt-3 space-y-2">
                  <div className="flex justify-between text-xs text-black/50 dark:text-white/40">
                    <span>Distance charge ({result.distanceKm} km / trip)</span>
                    <span>per trip</span>
                  </div>
                  <div className="flex justify-between text-xs text-black/50 dark:text-white/40">
                    <span>Base fare</span>
                    <span>incl. in total</span>
                  </div>
                </div>

                <div className="border-t border-mist dark:border-line pt-3 flex items-center justify-between">
                  <span className="font-bold text-black dark:text-white">Total charge</span>
                  <span className="text-xl font-extrabold text-brand">{formatCost(result.totalCost)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-mist/20 dark:bg-brand/10 border border-mist dark:border-line text-xs text-black/60 dark:text-white/50">
            <Info className="h-4 w-4 text-brand shrink-0 mt-0.5" />
            <span>
              Drive time uses real road distance via Google Maps (traffic-aware). Heavy trucks are slower than car routing —
              a speed multiplier is applied per vehicle class. All charges are estimates; actual billing may vary.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
