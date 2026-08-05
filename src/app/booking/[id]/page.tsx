import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { vehicles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import SiteNav from '@/components/SiteNav';
import BookingFlow from './BookingFlow';
import type { VehicleDTO } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Complete your booking | Vanguard', robots: { index: false } };

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = Number.parseInt(id, 10);
  if (Number.isNaN(n)) notFound();

  const [v] = await db.select().from(vehicles).where(eq(vehicles.id, n)).limit(1);
  if (!v) notFound();

  return (
    <>
      <SiteNav />
      <main className="pt-[72px] min-h-screen">
        <Suspense fallback={<div className="p-24 text-center text-ink-600">Loading…</div>}>
          <BookingFlow vehicle={v as VehicleDTO} />
        </Suspense>
      </main>
    </>
  );
}
