'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Car, CalendarRange, Users2, TrendingUp, Plus, Trash2, Check, X } from 'lucide-react';
import SiteNav from '@/components/SiteNav';
import type { VehicleDTO } from '@/lib/types';

type AdminBooking = {
  id: number; status: string; totalPrice: string; pickupDate: string; returnDate: string;
  customer: string; email: string; brand: string; model: string;
};
type AdminUser = { id: number; name: string; email: string; role: string };
type Overview = { fleet: VehicleDTO[]; users: AdminUser[]; bookings: AdminBooking[]; revenue: number };

const EMPTY: Overview = { fleet: [], users: [], bookings: [], revenue: 0 };
const TABS = [
  { k: 'vehicles', label: 'Vehicles' },
  { k: 'bookings', label: 'Bookings' },
  { k: 'customers', label: 'Customers' },
] as const;

export default function AdminPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]['k']>('vehicles');
  const [d, setD] = useState<Overview>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [f, setF] = useState({
    brand: '', model: '', category: 'luxury', pricePerDay: '', transmission: 'Automatic',
    fuelType: 'Petrol', seats: '5', horsepower: '', image: '',
  });

  const load = useCallback(() => {
    fetch('/api/admin/overview').then((r) => r.json()).then(setD).catch(() => setD(EMPTY)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const addVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...f, seats: Number(f.seats), horsepower: f.horsepower ? Number(f.horsepower) : null, image: f.image || undefined }),
    });
    if (res.ok) {
      toast.success('Vehicle added to the fleet');
      setF({ ...f, brand: '', model: '', pricePerDay: '', horsepower: '', image: '' });
      setShowForm(false);
      load();
    } else toast.error('Could not add that vehicle');
  };

  const removeVehicle = async (id: number) => {
    const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Vehicle removed'); load(); }
    else toast.error((await res.json()).error ?? 'Could not remove vehicle');
  };

  const setStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    if (res.ok) { toast.success(`Booking ${status}`); load(); } else toast.error('Update failed');
  };

  return (
    <>
      <SiteNav />
      <main className="pt-[72px] min-h-screen pb-24">
        <section className="border-b border-line bg-raised">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow mb-3">Management console</div>
              <h1 className="display text-[clamp(2.2rem,6vw,3.5rem)]">Admin</h1>
            </div>
            <Link href="/" className="text-[0.8125rem] text-ink-700 hover:text-ink-900">← Back to site</Link>
          </div>
        </section>

        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <Stat icon={Car} label="Fleet size" value={String(d.fleet.length)} />
            <Stat icon={CalendarRange} label="Bookings" value={String(d.bookings.length)} />
            <Stat icon={Users2} label="Customers" value={String(d.users.length)} />
            <Stat icon={TrendingUp} label="Revenue" value={`$${d.revenue.toFixed(0)}`} />
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-line">
            {TABS.map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={`px-4 py-3 text-sm border-b-2 -mb-px transition-colors ${
                  tab === t.k ? 'border-accent-600 text-ink-900' : 'border-transparent text-ink-600 hover:text-ink-800'
                }`}
              >
                {t.label}
              </button>
            ))}
            {tab === 'vehicles' && (
              <button onClick={() => setShowForm((v) => !v)} className="btn btn-primary !py-2.5 !px-5 !text-[0.8125rem] ml-auto mb-2">
                {showForm ? <><X className="w-4 h-4" /> Close</> : <><Plus className="w-4 h-4" /> Add vehicle</>}
              </button>
            )}
          </div>

          {loading && <div className="text-ink-600 py-10">Loading console…</div>}

          {/* VEHICLES */}
          {!loading && tab === 'vehicles' && (
            <div className="space-y-4">
              {showForm && (
                <form onSubmit={addVehicle} className="panel rounded-2xl p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Input label="Brand" value={f.brand} onChange={(v) => setF({ ...f, brand: v })} required />
                  <Input label="Model" value={f.model} onChange={(v) => setF({ ...f, model: v })} required />
                  <Select label="Category" value={f.category} onChange={(v) => setF({ ...f, category: v })} options={['luxury', 'sports', 'suv', 'electric']} />
                  <Input label="Price / day" type="number" value={f.pricePerDay} onChange={(v) => setF({ ...f, pricePerDay: v })} required />
                  <Select label="Transmission" value={f.transmission} onChange={(v) => setF({ ...f, transmission: v })} options={['Automatic', 'Manual']} />
                  <Select label="Fuel" value={f.fuelType} onChange={(v) => setF({ ...f, fuelType: v })} options={['Petrol', 'Diesel', 'Electric', 'Hybrid']} />
                  <Input label="Seats" type="number" value={f.seats} onChange={(v) => setF({ ...f, seats: v })} />
                  <Input label="Horsepower" type="number" value={f.horsepower} onChange={(v) => setF({ ...f, horsepower: v })} />
                  <div className="sm:col-span-2 lg:col-span-3">
                    <Input label="Image URL (optional)" value={f.image} onChange={(v) => setF({ ...f, image: v })} />
                  </div>
                  <button className="btn btn-primary self-end">Add to fleet</button>
                </form>
              )}

              <div className="panel rounded-2xl divide-y divide-line overflow-hidden">
                {d.fleet.map((v) => (
                  <div key={v.id} className="flex items-center gap-4 p-4">
                    <img src={v.image} alt="" className="w-24 h-16 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="tracking-tight truncate">{v.brand} {v.model}</div>
                      <div className="text-[0.75rem] text-ink-600 capitalize">
                        {v.category} · {v.transmission} · {v.fuelType} · {v.seats} seats{v.horsepower ? ` · ${v.horsepower} hp` : ''}
                      </div>
                    </div>
                    <div className="text-lg num shrink-0">${Math.round(Number(v.pricePerDay))}</div>
                    <button onClick={() => removeVehicle(v.id)} aria-label={`Delete ${v.brand} ${v.model}`}
                      className="w-9 h-9 grid place-items-center rounded-lg border border-line text-ink-600 hover:text-red-300 hover:border-red-400/40 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOOKINGS */}
          {!loading && tab === 'bookings' && (
            <div className="panel rounded-2xl divide-y divide-line overflow-hidden">
              {d.bookings.length === 0 && <Empty text="No bookings have been made yet." />}
              {d.bookings.map((b) => (
                <div key={b.id} className="flex flex-wrap gap-4 items-center p-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="tracking-tight">{b.brand} {b.model}</div>
                    <div className="text-[0.75rem] text-ink-600">{b.customer} · {b.email}</div>
                  </div>
                  <div className="text-[0.75rem] text-ink-600 num">
                    {new Date(b.pickupDate).toLocaleDateString()} → {new Date(b.returnDate).toLocaleDateString()}
                  </div>
                  <div className="text-lg num">${Number(b.totalPrice).toFixed(0)}</div>
                  <span className={`text-[0.5625rem] tracking-[0.16em] uppercase px-2 py-1 rounded ${
                    b.status === 'cancelled' ? 'bg-red-500/15 text-red-300' : 'bg-emerald-500/15 text-emerald-300'
                  }`}>{b.status}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setStatus(b.id, 'confirmed')} aria-label="Approve"
                      className="w-9 h-9 grid place-items-center rounded-lg border border-line hover:border-emerald-400/50 hover:text-emerald-300 transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setStatus(b.id, 'cancelled')} aria-label="Cancel"
                      className="w-9 h-9 grid place-items-center rounded-lg border border-line hover:border-red-400/50 hover:text-red-300 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CUSTOMERS */}
          {!loading && tab === 'customers' && (
            <div className="panel rounded-2xl divide-y divide-line overflow-hidden">
              {d.users.length === 0 && <Empty text="No customers have registered yet." />}
              {d.users.map((u) => (
                <div key={u.id} className="flex items-center gap-4 p-4">
                  <div className="w-9 h-9 rounded-full bg-accent-600 grid place-items-center text-white text-xs font-semibold shrink-0">
                    {u.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{u.name}</div>
                    <div className="text-[0.75rem] text-ink-600 truncate">{u.email}</div>
                  </div>
                  <span className="text-[0.5625rem] tracking-[0.16em] uppercase text-ink-600 border border-line rounded px-2 py-1">{u.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="panel rounded-2xl p-6">
      <Icon className="w-4 h-4 text-accent-600 mb-4" strokeWidth={1.5} />
      <div className="text-[0.625rem] tracking-[0.2em] uppercase text-ink-600">{label}</div>
      <div className="text-3xl num tracking-tight mt-1.5">{value}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">{label}</span>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="field mt-1.5 !py-2.5 !text-sm" />
    </label>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <label className="block">
      <span className="text-[0.625rem] tracking-[0.18em] uppercase text-ink-600">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field mt-1.5 !py-2.5 !text-sm capitalize">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="py-16 text-center text-sm text-ink-600">{text}</div>;
}
