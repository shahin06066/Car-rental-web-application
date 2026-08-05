'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Info } from 'lucide-react';
import { LOCATIONS } from '@/lib/types';

const iso = (d: Date) => d.toISOString().slice(0, 10);
const plus = (n: number) => iso(new Date(Date.now() + n * 86400000));

export default function BookingWidget({
  vehicleId,
  pricePerDay,
  available,
}: {
  vehicleId: number;
  pricePerDay: number;
  available: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [location, setLocation] = useState(params.get('location') ?? LOCATIONS[0]);
  const [pickup, setPickup] = useState(params.get('pickup') || plus(1));
  const [ret, setRet] = useState(params.get('return') || plus(4));
  const [err, setErr] = useState('');

  const days = useMemo(() => {
    const a = new Date(pickup).getTime();
    const b = new Date(ret).getTime();
    if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0;
    return Math.ceil((b - a) / 86400000);
  }, [pickup, ret]);

  const subtotal = days * pricePerDay;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const go = () => {
    if (days <= 0) return setErr('Return date must be after the pickup date.');
    setErr('');
    router.push(`/booking/${vehicleId}?pickup=${pickup}&return=${ret}&location=${encodeURIComponent(location)}`);
  };

  return (
    <div className="panel rounded-2xl p-6 sm:p-7">
      <div className="flex items-baseline gap-2 pb-6 mb-6 border-b border-line">
        <span className="text-4xl num tracking-[-0.03em]">${pricePerDay}</span>
        <span className="text-sm text-ink-600">per day</span>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">Pickup location</span>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="field mt-1.5">
            {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">Pickup</span>
            <input type="date" min={iso(new Date())} value={pickup} onChange={(e) => setPickup(e.target.value)} className="field mt-1.5" />
          </label>
          <label className="block">
            <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">Return</span>
            <input type="date" min={pickup} value={ret} onChange={(e) => setRet(e.target.value)} className="field mt-1.5" />
          </label>
        </div>
      </div>

      {days > 0 && (
        <div className="mt-6 pt-5 border-t border-line space-y-2.5 text-sm">
          <Row label={`$${pricePerDay} × ${days} ${days === 1 ? 'day' : 'days'}`} value={subtotal} />
          <Row label="Taxes & fees (8%)" value={tax} muted />
          <div className="flex justify-between pt-3 mt-1 border-t border-line text-base">
            <span>Estimated total</span>
            <span className="num text-accent-700">${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {err && <p role="alert" className="text-[0.8125rem] text-red-400 mt-4">{err}</p>}

      <button onClick={go} disabled={!available} className="btn btn-primary w-full mt-6">
        {available ? 'Continue to booking' : 'Currently unavailable'}
        {available && <ArrowRight className="w-4 h-4" />}
      </button>

      <p className="flex items-start gap-2 text-[0.75rem] text-ink-600 mt-4 leading-relaxed">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        You won&apos;t be charged yet. Free cancellation up to 48 hours before pickup.
      </p>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className={`flex justify-between ${muted ? 'text-ink-600' : 'text-ink-800'}`}>
      <span>{label}</span>
      <span className="num">${value.toFixed(2)}</span>
    </div>
  );
}
