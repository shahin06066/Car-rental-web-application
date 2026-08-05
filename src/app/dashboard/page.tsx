'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Calendar, MapPin, Car, Wallet, LogOut, Plus } from 'lucide-react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import type { BookingRow } from '@/lib/types';

export default function Dashboard() {
  const [user, setUser] = useState({ name: 'Guest Driver', email: 'demo@vanguard.com' });
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');
  const [now, setNow] = useState(0);

  const load = useCallback((email: string) => {
    setLoading(true);
    fetch(`/api/bookings?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      let u = { name: 'Guest Driver', email: 'demo@vanguard.com' };
      try {
        const raw = localStorage.getItem('user');
        if (raw) u = { ...u, ...JSON.parse(raw) };
      } catch {}
      setUser(u);
      setNow(Date.now());
      load(u.email);
    }, 0);
    return () => clearTimeout(id);
  }, [load]);

  const cancel = async (id: number) => {
    const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Booking cancelled — refund initiated');
      load(user.email);
    } else toast.error('Could not cancel that booking');
  };

  const signOut = () => {
    localStorage.removeItem('user');
    toast.success('Signed out');
    window.location.href = '/';
  };

  const upcoming = rows.filter((b) => b.status !== 'cancelled' && new Date(b.returnDate).getTime() >= now);
  const history = rows.filter((b) => b.status === 'cancelled' || new Date(b.returnDate).getTime() < now);
  const spend = rows.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + Number(b.totalPrice), 0);
  const list = tab === 'upcoming' ? upcoming : history;

  return (
    <>
      <SiteNav />
      <main className="pt-[72px] min-h-screen">
        {/* Header */}
        <section className="border-b border-line bg-raised">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow mb-3">Member since 2026</div>
              <h1 className="display text-[clamp(2.2rem,6vw,3.5rem)]">{user.name}</h1>
              <p className="text-ink-600 text-sm mt-2">{user.email}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={signOut} className="btn btn-ghost !py-3 !px-5 !text-[0.8125rem]">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
              <Link href="/cars" className="btn btn-primary !py-3">
                <Plus className="w-4 h-4" /> New booking
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-10">
          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            <Stat icon={Car} label="Total bookings" value={String(rows.length)} />
            <Stat icon={Calendar} label="Upcoming" value={String(upcoming.length)} />
            <Stat icon={Wallet} label="Lifetime spend" value={`$${spend.toFixed(0)}`} />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-line">
            {(['upcoming', 'history'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm capitalize border-b-2 -mb-px transition-colors ${
                  tab === t ? 'border-accent-600 text-ink-900' : 'border-transparent text-ink-600 hover:text-ink-800'
                }`}
              >
                {t} <span className="num text-ink-600 ml-1">({t === 'upcoming' ? upcoming.length : history.length})</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => <div key={i} className="h-28 rounded-2xl bg-raised animate-pulse" />)}
            </div>
          ) : list.length === 0 ? (
            <div className="panel rounded-2xl py-20 text-center px-6">
              <Car className="w-8 h-8 mx-auto text-ink-500 mb-5" strokeWidth={1.2} />
              <h3 className="text-lg mb-2">{tab === 'upcoming' ? 'No upcoming rentals' : 'No past rentals yet'}</h3>
              <p className="text-sm text-ink-600 max-w-xs mx-auto mb-7">
                {tab === 'upcoming'
                  ? 'When you book a car it will appear here with all your trip details.'
                  : 'Completed and cancelled bookings will be archived here.'}
              </p>
              <Link href="/cars" className="btn btn-primary">Browse the fleet</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {list.map((b) => <BookingCard key={b.id} b={b} onCancel={tab === 'upcoming' ? cancel : undefined} />)}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
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

function BookingCard({ b, onCancel }: { b: BookingRow; onCancel?: (id: number) => void }) {
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const cancelled = b.status === 'cancelled';

  return (
    <article className="panel rounded-2xl p-4 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
      <img src={b.image} alt="" className={`w-full sm:w-32 h-24 sm:h-20 object-cover rounded-xl ${cancelled ? 'grayscale opacity-50' : ''}`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1.5">
          <h3 className="text-lg tracking-tight truncate">{b.brand} {b.model}</h3>
          <span className={`text-[0.5625rem] tracking-[0.16em] uppercase px-2 py-1 rounded shrink-0 ${
            cancelled ? 'bg-red-500/15 text-red-300' : 'bg-emerald-500/15 text-emerald-300'
          }`}>
            {b.status}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[0.8125rem] text-ink-700">
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{fmt(b.pickupDate)} → {fmt(b.returnDate)}</span>
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{b.pickupLocation}</span>
          <span className="num">{b.totalDays} {b.totalDays === 1 ? 'day' : 'days'}</span>
        </div>
      </div>

      <div className="flex items-center gap-5 shrink-0 w-full sm:w-auto justify-between">
        <div className="text-right">
          <div className="text-xl num">${Number(b.totalPrice).toFixed(0)}</div>
          <div className="text-[0.625rem] uppercase tracking-[0.16em] text-ink-600">{b.paymentStatus}</div>
        </div>
        {onCancel && !cancelled && (
          <button onClick={() => onCancel(b.id)} className="btn btn-ghost !py-2.5 !px-4 !text-[0.8125rem] hover:!border-red-400/50 hover:!text-red-300">
            Cancel
          </button>
        )}
      </div>
    </article>
  );
}
