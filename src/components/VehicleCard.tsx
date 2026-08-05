import Link from 'next/link';
import { Star, ArrowUpRight } from 'lucide-react';
import type { VehicleDTO } from '@/lib/types';

export default function VehicleCard({ v, priority = false }: { v: VehicleDTO; priority?: boolean }) {
  const specs = [
    `${v.seats} seats`,
    v.fuelType,
    v.horsepower ? `${v.horsepower} hp` : v.transmission,
  ];

  return (
    <article className="v-card group flex flex-col">
      <Link href={`/cars/${v.id}`} className="block relative aspect-[4/3] overflow-hidden bg-raised">
        <img
          src={v.image}
          alt={`${v.year} ${v.brand} ${v.model}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="w-full h-full object-cover"
        />

        {!v.available && (
          <span className="absolute top-4 left-4 text-[0.625rem] tracking-[0.18em] uppercase px-2.5 py-1.5 rounded-full bg-deep/85 text-white backdrop-blur">
            Reserved
          </span>
        )}

        <span className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/95 text-ink-900 grid place-items-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <ArrowUpRight className="w-4 h-4" />
        </span>
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[0.6875rem] tracking-[0.2em] uppercase text-accent-600 mb-1.5">{v.brand}</div>
            <h3 className="display text-2xl leading-tight text-ink-900 truncate">{v.model}</h3>
          </div>
          <div className="flex items-center gap-1 text-[0.8125rem] text-ink-600 shrink-0 pt-1">
            <Star className="w-3.5 h-3.5 fill-accent-600 text-accent-600" />
            <span className="num">{v.rating}</span>
          </div>
        </div>

        <ul className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-4 text-[0.8125rem] text-ink-500">
          {specs.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className="w-1 h-1 rounded-full bg-line-strong" />}
              {s}
            </li>
          ))}
        </ul>

        <div className="flex items-end justify-between gap-3 mt-6 pt-5 border-t border-line">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[1.75rem] num tracking-[-0.03em] text-ink-900 leading-none">
              ${Math.round(Number(v.pricePerDay))}
            </span>
            <span className="text-[0.8125rem] text-ink-500">/ day</span>
          </div>
          <Link
            href={`/cars/${v.id}`}
            className="text-[0.8125rem] font-medium text-ink-900 border-b border-ink-900/25 hover:border-accent-600 hover:text-accent-600 transition-colors pb-0.5"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
