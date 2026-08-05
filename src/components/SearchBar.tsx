'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MapPin, CalendarDays, Search } from 'lucide-react';
import { LOCATIONS } from '@/lib/types';

const today = () => new Date().toISOString().slice(0, 10);
const plus = (d: number) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);

export default function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState<string>(LOCATIONS[0]);
  const [pickup, setPickup] = useState(plus(1));
  const [ret, setRet] = useState(plus(4));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/cars?location=${encodeURIComponent(location)}&pickup=${pickup}&return=${ret}`);
  };

  return (
    <form
      onSubmit={submit}
      className="glass rounded-2xl p-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr_auto] lg:items-stretch"
    >
      <Field label="Pick-up location" icon={MapPin}>
        <select value={location} onChange={(e) => setLocation(e.target.value)} className="cell">
          {LOCATIONS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </Field>

      <Field label="Pick-up date" icon={CalendarDays}>
        <input type="date" min={today()} value={pickup} onChange={(e) => setPickup(e.target.value)} className="cell" />
      </Field>

      <Field label="Return date" icon={CalendarDays}>
        <input type="date" min={pickup} value={ret} onChange={(e) => setRet(e.target.value)} className="cell" />
      </Field>

      <button type="submit" className="btn btn-primary !rounded-xl h-full min-h-[62px] lg:w-[168px]">
        <Search className="w-4 h-4" /> Search cars
      </button>
    </form>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <label className="group rounded-xl px-4 py-2.5 hover:bg-canvas focus-within:bg-canvas transition-colors cursor-pointer block">
      <span className="flex items-center gap-1.5 text-[0.625rem] tracking-[0.18em] uppercase text-ink-500 mb-1">
        <Icon className="w-3 h-3 text-accent-600" /> {label}
      </span>
      {children}
    </label>
  );
}
