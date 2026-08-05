'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Check, ArrowLeft, ArrowRight, Lock, PartyPopper, ShieldCheck, Baby, UserPlus, Wifi } from 'lucide-react';
import { LOCATIONS, type VehicleDTO } from '@/lib/types';

const STEPS = ['Location', 'Dates', 'Extras', 'Your details', 'Review', 'Payment'] as const;

const EXTRAS = [
  { key: 'Chauffeur service', price: 149, icon: UserPlus, desc: 'A professional driver for the duration' },
  { key: 'Child seat', price: 25, icon: Baby, desc: 'Group 1–3, fitted before delivery' },
  { key: 'Mobile wifi hotspot', price: 15, icon: Wifi, desc: 'Unlimited 5G data, up to 10 devices' },
];

const iso = (d: Date) => d.toISOString().slice(0, 10);
const plus = (n: number) => iso(new Date(Date.now() + n * 86400000));

export default function BookingFlow({ vehicle }: { vehicle: VehicleDTO }) {
  const router = useRouter();
  const params = useSearchParams();
  const price = Number(vehicle.pricePerDay);

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState<{ id: number; total: string } | null>(null);

  const [location, setLocation] = useState(params.get('location') ?? LOCATIONS[0]);
  const [pickup, setPickup] = useState(params.get('pickup') || plus(1));
  const [ret, setRet] = useState(params.get('return') || plus(4));
  const [extras, setExtras] = useState<string[]>([]);
  const [insurance, setInsurance] = useState(true);
  const [coupon, setCoupon] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [me, setMe] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          setMe((m) => ({ ...m, name: u.name ?? '', email: u.email ?? '' }));
        }
      } catch {}
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const t = useMemo(() => {
    const a = new Date(pickup).getTime();
    const b = new Date(ret).getTime();
    const days = !Number.isNaN(a) && !Number.isNaN(b) && b > a ? Math.ceil((b - a) / 86400000) : 0;
    const base = days * price;
    const extrasTotal = extras.reduce((s, k) => s + (EXTRAS.find((e) => e.key === k)?.price ?? 0) * days, 0);
    const ins = insurance ? 89 * days : 0;
    const sub = base + extrasTotal + ins;
    const discount = Math.round(sub * (discountPct / 100) * 100) / 100;
    const tax = Math.round((sub - discount) * 0.08 * 100) / 100;
    return { days, base, extrasTotal, ins, sub, discount, tax, total: Math.round((sub - discount + tax) * 100) / 100 };
  }, [pickup, ret, price, extras, insurance, discountPct]);

  const applyCoupon = () => {
    const c = coupon.trim().toUpperCase();
    const map: Record<string, number> = { VANGUARD10: 10, WELCOME15: 15 };
    if (map[c]) { setDiscountPct(map[c]); toast.success(`Code applied — ${map[c]}% off`); }
    else { setDiscountPct(0); toast.error('That promotional code is not valid'); }
  };

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(me.email);
  const canNext = [true, t.days > 0, true, me.name.trim().length > 1 && emailOk, true, true][step];

  const submit = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: vehicle.id, pickup, return: ret, location,
          extras, insurance, discountAmount: t.discount, email: me.email, name: me.name, phone: me.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      localStorage.setItem('user', JSON.stringify({ name: me.name, email: me.email }));
      setConfirmed({ id: data.booking.id, total: data.booking.totalPrice });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Booking failed');
    } finally {
      setBusy(false);
    }
  };

  /* ---------------- Confirmation ---------------- */
  if (confirmed) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-lime grid place-items-center mx-auto mb-7">
          <PartyPopper className="w-7 h-7 text-ink-900" />
        </div>
        <div className="eyebrow mb-3">Booking #{String(confirmed.id).padStart(5, '0')}</div>
        <h1 className="display text-[clamp(2.2rem,7vw,3.25rem)] mb-4">You&apos;re confirmed.</h1>
        <p className="text-ink-700 leading-relaxed mb-9">
          Your {vehicle.brand} {vehicle.model} is reserved for {t.days} {t.days === 1 ? 'day' : 'days'} from {location}.
          A confirmation email is on its way to <span className="text-ink-900">{me.email}</span>.
        </p>

        <div className="panel rounded-2xl p-6 text-left mb-8">
          <img src={vehicle.image} alt="" className="w-full h-40 object-cover rounded-xl mb-5" />
          <dl className="space-y-2.5 text-sm">
            <Line k="Vehicle" v={`${vehicle.brand} ${vehicle.model}`} />
            <Line k="Pickup" v={`${new Date(pickup).toDateString()} · ${location}`} />
            <Line k="Return" v={new Date(ret).toDateString()} />
            <div className="flex justify-between pt-3 border-t border-line text-base">
              <span>Total paid</span>
              <span className="num text-accent-700">${Number(confirmed.total).toFixed(2)}</span>
            </div>
          </dl>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="btn btn-primary">View my bookings</Link>
          <Link href="/cars" className="btn btn-ghost">Browse the fleet</Link>
        </div>
      </div>
    );
  }

  /* ---------------- Flow ---------------- */
  return (
    <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-10 pb-24">
      <Link href={`/cars/${vehicle.id}`} className="inline-flex items-center gap-1.5 text-[0.8125rem] text-ink-600 hover:text-ink-900 mb-8">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to vehicle
      </Link>

      <div className="mb-10">
        <div className="eyebrow mb-3">Reservation</div>
        <h1 className="display text-[clamp(2.2rem,6vw,3.5rem)]">Complete your booking</h1>
      </div>

      {/* Stepper */}
      <ol className="flex items-center gap-1.5 sm:gap-3 mb-10 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={`flex items-center gap-2 text-[0.75rem] sm:text-[0.8125rem] transition-colors ${
                i === step ? 'text-ink-900' : i < step ? 'text-accent-600 hover:text-accent-700 font-medium' : 'text-ink-500'
              }`}
            >
              <span className={`w-6 h-6 rounded-full grid place-items-center text-[0.6875rem] border shrink-0 ${
                i < step ? 'bg-lime border-lime text-ink-900'
                : i === step ? 'border-accent-600 text-accent-700'
                : 'border-line'
              }`}>
                {i < step ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
              </span>
              <span className="hidden sm:inline whitespace-nowrap">{s}</span>
            </button>
            {i < STEPS.length - 1 && <span className={`w-4 sm:w-8 h-px ${i < step ? 'bg-lime-deep' : 'bg-raised'}`} />}
          </li>
        ))}
      </ol>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        <div className="panel rounded-2xl p-6 sm:p-9 min-h-[420px] flex flex-col">
          {step === 0 && (
            <Pane title="Where would you like to collect?" sub="We deliver free of charge within 25 miles of each city.">
              <div className="grid sm:grid-cols-2 gap-3">
                {LOCATIONS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLocation(l)}
                    className={`text-left rounded-xl border p-5 transition-all ${
                      location === l ? 'border-ink-900 bg-lime-tint' : 'border-line hover:border-line-strong'
                    }`}
                  >
                    <div className="text-lg">{l}</div>
                    <div className="text-[0.75rem] text-ink-600 mt-0.5">Delivery included</div>
                  </button>
                ))}
              </div>
            </Pane>
          )}

          {step === 1 && (
            <Pane title="When do you need it?" sub="Minimum rental is one day. Longer bookings unlock better rates.">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">Pickup date</span>
                  <input type="date" min={iso(new Date())} value={pickup} onChange={(e) => setPickup(e.target.value)} className="field mt-1.5" />
                </label>
                <label className="block">
                  <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">Return date</span>
                  <input type="date" min={pickup} value={ret} onChange={(e) => setRet(e.target.value)} className="field mt-1.5" />
                </label>
              </div>
              <div className="mt-5 text-sm text-ink-700">
                {t.days > 0 ? <>Duration: <span className="text-ink-900 num">{t.days}</span> {t.days === 1 ? 'day' : 'days'}</> : 'Select a valid date range to continue.'}
              </div>
            </Pane>
          )}

          {step === 2 && (
            <Pane title="Add optional extras" sub="Priced per day. You can change these later by calling the concierge.">
              <div className="space-y-3">
                <Toggle
                  on={insurance}
                  onClick={() => setInsurance((v) => !v)}
                  icon={ShieldCheck}
                  title="Zero-excess insurance"
                  desc="Reduces your $2,500 excess to zero"
                  price={89}
                />
                {EXTRAS.map((e) => (
                  <Toggle
                    key={e.key}
                    on={extras.includes(e.key)}
                    onClick={() => setExtras((p) => (p.includes(e.key) ? p.filter((x) => x !== e.key) : [...p, e.key]))}
                    icon={e.icon}
                    title={e.key}
                    desc={e.desc}
                    price={e.price}
                  />
                ))}
              </div>
            </Pane>
          )}

          {step === 3 && (
            <Pane title="Who is driving?" sub="The named driver must present a matching licence at collection.">
              <div className="space-y-3">
                <label className="block">
                  <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">Full name</span>
                  <input value={me.name} onChange={(e) => setMe({ ...me, name: e.target.value })} placeholder="Alex Rivera" className="field mt-1.5" />
                </label>
                <label className="block">
                  <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">Email address</span>
                  <input type="email" value={me.email} onChange={(e) => setMe({ ...me, email: e.target.value })} placeholder="alex@example.com" className="field mt-1.5" />
                  {me.email && !emailOk && <span className="text-[0.75rem] text-red-400 mt-1.5 block">Enter a valid email address</span>}
                </label>
                <label className="block">
                  <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">Phone (optional)</span>
                  <input value={me.phone} onChange={(e) => setMe({ ...me, phone: e.target.value })} placeholder="+1 555 019 2837" className="field mt-1.5" />
                </label>
              </div>
            </Pane>
          )}

          {step === 4 && (
            <Pane title="Review your reservation" sub="Check everything over — you can still go back and adjust.">
              <dl className="space-y-2.5 text-sm mb-7">
                <Line k="Vehicle" v={`${vehicle.year} ${vehicle.brand} ${vehicle.model}`} />
                <Line k="Location" v={location} />
                <Line k="Dates" v={`${new Date(pickup).toDateString()} → ${new Date(ret).toDateString()}`} />
                <Line k="Driver" v={me.name || '—'} />
                <Line k="Extras" v={[insurance && 'Zero-excess insurance', ...extras].filter(Boolean).join(', ') || 'None'} />
              </dl>
              <div className="flex flex-col sm:flex-row gap-3">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Promo code (try WELCOME15)" className="field flex-1" />
                <button onClick={applyCoupon} className="btn btn-ghost">Apply</button>
              </div>
            </Pane>
          )}

          {step === 5 && (
            <Pane title="Secure payment" sub="Card details are tokenised by our payment provider and never stored on our servers.">
              <div className="space-y-3">
                <label className="block">
                  <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">Card number</span>
                  <input defaultValue="4242 4242 4242 4242" inputMode="numeric" className="field mt-1.5 num tracking-wider" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">Expiry</span>
                    <input defaultValue="12 / 28" className="field mt-1.5 num" />
                  </label>
                  <label className="block">
                    <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">CVC</span>
                    <input defaultValue="424" className="field mt-1.5 num" />
                  </label>
                </div>
              </div>
              <p className="flex items-center gap-2 text-[0.75rem] text-ink-600 mt-5">
                <Lock className="w-3.5 h-3.5" /> Test mode — no real charge will be made.
              </p>
            </Pane>
          )}

          {/* Nav */}
          <div className="flex gap-3 mt-auto pt-8">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="btn btn-ghost">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="btn btn-primary flex-1">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={submit} disabled={busy} className="btn btn-primary flex-1">
                {busy ? 'Processing…' : `Pay $${t.total.toFixed(2)} & confirm`}
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <aside className="panel rounded-2xl overflow-hidden lg:sticky lg:top-24">
          <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-40 object-cover" />
          <div className="p-6">
            <div className="eyebrow mb-1.5">{vehicle.category}</div>
            <div className="text-lg tracking-tight mb-5">{vehicle.brand} {vehicle.model}</div>

            <div className="space-y-2.5 text-[0.8125rem] border-t border-line pt-5">
              <Row k={`$${price} × ${t.days} ${t.days === 1 ? 'day' : 'days'}`} v={t.base} />
              {t.extrasTotal > 0 && <Row k="Extras" v={t.extrasTotal} />}
              {t.ins > 0 && <Row k="Zero-excess insurance" v={t.ins} />}
              {t.discount > 0 && <Row k={`Discount (${discountPct}%)`} v={-t.discount} accent />}
              <Row k="Taxes & fees" v={t.tax} muted />
            </div>

            <div className="flex justify-between pt-4 mt-4 border-t border-line">
              <span>Total</span>
              <span className="text-xl num text-accent-700">${t.total.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Pane({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl tracking-tight mb-1.5">{title}</h2>
      <p className="text-[0.875rem] text-ink-600 mb-7">{sub}</p>
      {children}
    </div>
  );
}

function Toggle({ on, onClick, icon: Icon, title, desc, price }: {
  on: boolean; onClick: () => void; icon: React.ElementType; title: string; desc: string; price: number;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`w-full flex items-center gap-4 text-left rounded-xl border p-4 transition-all ${
        on ? 'border-ink-900 bg-lime-tint' : 'border-line hover:border-line-strong'
      }`}
    >
      <span className={`w-10 h-10 rounded-lg grid place-items-center shrink-0 ${on ? 'bg-lime text-ink-900' : 'bg-raised text-ink-700'}`}>
        <Icon className="w-[18px] h-[18px]" strokeWidth={1.6} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[0.9375rem]">{title}</span>
        <span className="block text-[0.75rem] text-ink-600 truncate">{desc}</span>
      </span>
      <span className="text-sm num text-ink-800 shrink-0">${price}<span className="text-ink-600">/day</span></span>
    </button>
  );
}

function Row({ k, v, muted, accent }: { k: string; v: number; muted?: boolean; accent?: boolean }) {
  return (
    <div className={`flex justify-between ${accent ? 'text-accent-700' : muted ? 'text-ink-600' : 'text-ink-800'}`}>
      <span>{k}</span>
      <span className="num">{v < 0 ? '−' : ''}${Math.abs(v).toFixed(2)}</span>
    </div>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-6">
      <dt className="text-ink-600 shrink-0">{k}</dt>
      <dd className="text-right text-ink-800">{v}</dd>
    </div>
  );
}
