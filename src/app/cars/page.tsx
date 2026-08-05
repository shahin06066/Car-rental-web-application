import { Suspense } from 'react';
import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import FleetBrowser from './FleetBrowser';

export const metadata: Metadata = {
  title: 'The Fleet | Vanguard Premium Car Rental',
  description: 'Browse our hand-selected fleet of sports, luxury, SUV and electric vehicles. Filter by category, power, price and availability.',
};

export default function CarsPage() {
  return (
    <>
      <SiteNav />
      <main className="pt-[72px] min-h-screen">
        <Suspense fallback={<div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-24 text-ink-600">Loading fleet…</div>}>
          <FleetBrowser />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
