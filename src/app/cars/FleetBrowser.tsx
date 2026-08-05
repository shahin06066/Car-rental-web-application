'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, Search, ArrowDownUp } from 'lucide-react';
import VehicleCard from '@/components/VehicleCard';
import Reveal from '@/components/Reveal';
import { CATEGORIES, LOCATIONS, type VehicleDTO } from '@/lib/types';

type Filters = {
  q: string;
  category: string;
  transmission: string;
  fuelType: string;
  seats: string;
  max: number;
  sort: string;
};

const MAX_PRICE = 900;

const DEFAULTS: Filters = { q: '', category: '', transmission: '', fuelType: '', seats: '', max: MAX_PRICE, sort: 'featured' };

export default function FleetBrowser() {
  const params = useSearchParams();
  const [all, setAll] = useState<VehicleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [f, setF] = useState<Filters>({ ...DEFAULTS, category: params.get('category') ?? '' });
  const [debouncedQ, setDebouncedQ] = useState('');

  const location = params.get('location') ?? LOCATIONS[0];
  const pickup = params.get('pickup') ?? '';
  const ret = params.get('return') ?? '';

  useEffect(() => {
    fetch('/api/vehicles')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setAll(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // debounce free-text search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(f.q.trim().toLowerCase()), 220);
    return () => clearTimeout(t);
  }, [f.q]);

  const set = useCallback(<K extends keyof Filters>(k: K, v: Filters[K]) => setF((p) => ({ ...p, [k]: v })), []);

  const results = useMemo(() => {
    let r = all.filter((v) => {
      if (debouncedQ && !`${v.brand} ${v.model} ${v.category}`.toLowerCase().includes(debouncedQ)) return false;
      if (f.category && v.category !== f.category) return false;
      if (f.transmission && v.transmission !== f.transmission) return false;
      if (f.fuelType && v.fuelType !== f.fuelType) return false;
      if (f.seats && v.seats < Number(f.seats)) return false;
      if (Number(v.pricePerDay) > f.max) return false;
      return true;
    });

    const by: Record<string, (a: VehicleDTO, b: VehicleDTO) => number> = {
      'price-asc': (a, b) => Number(a.pricePerDay) - Number(b.pricePerDay),
      'price-desc': (a, b) => Number(b.pricePerDay) - Number(a.pricePerDay),
      'power': (a, b) => (b.horsepower ?? 0) - (a.horsepower ?? 0),
      'rating': (a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0),
      featured: (a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0),
    };
    r = [...r].sort(by[f.sort] ?? by.featured);
    return r;
  }, [all, f, debouncedQ]);

  const activeCount =
    (f.category ? 1 : 0) + (f.transmission ? 1 : 0) + (f.fuelType ? 1 : 0) + (f.seats ? 1 : 0) + (f.max < MAX_PRICE ? 1 : 0);

  const panel = (
    <div className="space-y-7">
      <FilterGroup label="Category">
        <div className="flex flex-wrap gap-2">
          <Chip active={!f.category} onClick={() => set('category', '')}>All</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.key} active={f.category === c.key} onClick={() => set('category', c.key)}>
              {c.label}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label={`Max price — $${f.max}/day`}>
        <input
          type="range"
          min={150}
          max={MAX_PRICE}
          step={5}
          value={f.max}
          onChange={(e) => set('max', Number(e.target.value))}
          className="w-full accent-accent-600 cursor-pointer"
          aria-label="Maximum price per day"
        />
        <div className="flex justify-between text-[0.6875rem] text-ink-600 mt-1.5 num">
          <span>$150</span>
          <span>${MAX_PRICE}</span>
        </div>
      </FilterGroup>

      <FilterGroup label="Transmission">
        <div className="flex flex-wrap gap-2">
          <Chip active={!f.transmission} onClick={() => set('transmission', '')}>Any</Chip>
          <Chip active={f.transmission === 'Automatic'} onClick={() => set('transmission', 'Automatic')}>Automatic</Chip>
          <Chip active={f.transmission === 'Manual'} onClick={() => set('transmission', 'Manual')}>Manual</Chip>
        </div>
      </FilterGroup>

      <FilterGroup label="Fuel type">
        <div className="flex flex-wrap gap-2">
          <Chip active={!f.fuelType} onClick={() => set('fuelType', '')}>Any</Chip>
          {['Petrol', 'Diesel', 'Electric'].map((x) => (
            <Chip key={x} active={f.fuelType === x} onClick={() => set('fuelType', x)}>{x}</Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Minimum seats">
        <div className="flex flex-wrap gap-2">
          <Chip active={!f.seats} onClick={() => set('seats', '')}>Any</Chip>
          {['2', '4', '5', '7'].map((x) => (
            <Chip key={x} active={f.seats === x} onClick={() => set('seats', x)}>{x}+</Chip>
          ))}
        </div>
      </FilterGroup>

      <button onClick={() => setF({ ...DEFAULTS })} className="btn btn-ghost w-full !py-3 !text-[0.8125rem]">
        Reset all filters
      </button>
    </div>
  );

  return (
    <>
      {/* Header */}
      <section className="border-b border-line bg-raised">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-12 sm:py-16">
          <div className="eyebrow mb-4">{location}{pickup && ret ? ` · ${fmt(pickup)} – ${fmt(ret)}` : ''}</div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h1 className="display text-[clamp(2.6rem,8vw,5rem)]">The Fleet</h1>
            <p className="text-ink-700 text-sm max-w-sm leading-relaxed pb-2">
              Nine vehicles, four cities. Every car detailed and mechanically checked before handover.
            </p>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="sticky top-[72px] z-30 bg-canvas/90 backdrop-blur-xl border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-3 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-600" />
            <input
              value={f.q}
              onChange={(e) => set('q', e.target.value)}
              placeholder="Search brand or model…"
              aria-label="Search vehicles"
              className="field !py-2.5 !pl-10 !text-sm"
            />
          </div>

          <button onClick={() => setDrawer(true)} className="btn btn-ghost !py-2.5 !px-4 !text-[0.8125rem] lg:hidden">
            <SlidersHorizontal className="w-4 h-4" />
            Filters{activeCount > 0 && <span className="ml-1 text-accent-700 num">({activeCount})</span>}
          </button>

          <div className="relative ml-auto hidden sm:block">
            <ArrowDownUp className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-600 pointer-events-none" />
            <select
              value={f.sort}
              onChange={(e) => set('sort', e.target.value)}
              aria-label="Sort vehicles"
              className="field !py-2.5 !pl-9 !pr-8 !text-sm w-[190px]"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="power">Most powerful</option>
              <option value="rating">Highest rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-10 grid lg:grid-cols-[268px_1fr] gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-[148px] panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[0.6875rem] tracking-[0.24em] uppercase text-ink-600">Refine</span>
              {activeCount > 0 && <span className="text-[0.6875rem] text-accent-700 num">{activeCount} active</span>}
            </div>
            {panel}
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-ink-700">
              <span className="text-ink-900 num">{results.length}</span> {results.length === 1 ? 'vehicle' : 'vehicles'} available
            </p>
          </div>

          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-line overflow-hidden animate-pulse">
                  <div className="aspect-[16/10] bg-raised" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-raised rounded w-2/3" />
                    <div className="h-3 bg-raised rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <EmptyState title="Could not load the fleet" body="Something went wrong reaching our servers. Please refresh and try again.">
              <button onClick={() => window.location.reload()} className="btn btn-ghost">Retry</button>
            </EmptyState>
          )}

          {!loading && !error && results.length === 0 && (
            <EmptyState title="No vehicles match those filters" body="Try widening your price range or clearing a filter or two.">
              <button onClick={() => setF({ ...DEFAULTS })} className="btn btn-primary">Reset filters</button>
            </EmptyState>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((v, i) => (
                <Reveal key={v.id} delay={Math.min(i, 5) * 60}>
                  <VehicleCard v={v} priority={i < 3} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity ${drawer ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDrawer(false)} />
        <div
          className={`absolute bottom-0 inset-x-0 max-h-[86vh] overflow-y-auto bg-raised border-t border-line rounded-t-3xl p-6 transition-transform duration-300 ${
            drawer ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <span className="text-[0.6875rem] tracking-[0.24em] uppercase text-ink-600">Refine</span>
            <button onClick={() => setDrawer(false)} aria-label="Close filters" className="w-9 h-9 grid place-items-center rounded-lg border border-line">
              <X className="w-4 h-4" />
            </button>
          </div>
          {panel}
          <button onClick={() => setDrawer(false)} className="btn btn-primary w-full mt-5">
            Show {results.length} {results.length === 1 ? 'vehicle' : 'vehicles'}
          </button>
        </div>
      </div>
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[0.6875rem] tracking-[0.16em] uppercase text-ink-600 mb-3">{label}</div>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3.5 py-2 rounded-lg text-[0.8125rem] border transition-all duration-200 ${
        active
          ? 'bg-lime text-ink-900 border-lime font-semibold'
          : 'border-line text-ink-700 hover:border-line hover:text-ink-900'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="panel rounded-2xl py-20 px-8 text-center">
      <h3 className="text-xl mb-2">{title}</h3>
      <p className="text-sm text-ink-700 max-w-sm mx-auto mb-7">{body}</p>
      {children}
    </div>
  );
}

function fmt(d: string) {
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
