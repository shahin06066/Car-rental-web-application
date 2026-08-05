import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { vehicles } from '@/db/schema';
import { eq, ne, and } from 'drizzle-orm';
import { Star, Users, Fuel, Gauge, Timer, Cog, Calendar, ShieldCheck, MapPin, IdCard, Check, ArrowLeft } from 'lucide-react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import VehicleCard from '@/components/VehicleCard';
import Reveal from '@/components/Reveal';
import Gallery from './Gallery';
import BookingWidget from './BookingWidget';
import type { VehicleDTO } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getVehicle(id: string) {
  const n = Number.parseInt(id, 10);
  if (Number.isNaN(n)) return null;
  const [v] = await db.select().from(vehicles).where(eq(vehicles.id, n)).limit(1);
  return (v as VehicleDTO) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const v = await getVehicle(id);
  if (!v) return { title: 'Vehicle not found | Vanguard' };
  const title = `Rent the ${v.year} ${v.brand} ${v.model} | Vanguard`;
  const description = v.description ?? `Rent the ${v.brand} ${v.model} from $${v.pricePerDay} per day.`;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: v.image }], type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: [v.image] },
  };
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = await getVehicle(id);
  if (!v) notFound();

  const similar = (await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.category, v.category), ne(vehicles.id, v.id)))
    .limit(3)) as VehicleDTO[];

  const images = [v.image, ...(v.gallery ?? [])];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${v.brand} ${v.model}`,
    image: images,
    description: v.description,
    brand: { '@type': 'Brand', name: v.brand },
    offers: {
      '@type': 'Offer',
      price: v.pricePerDay,
      priceCurrency: 'USD',
      availability: v.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: v.rating, reviewCount: v.reviewCount || 1 },
  };

  const specs = [
    { icon: Gauge, label: 'Power', value: v.horsepower ? `${v.horsepower} hp` : '—' },
    { icon: Timer, label: '0–60 mph', value: v.acceleration ? `${v.acceleration}s` : '—' },
    { icon: Gauge, label: 'Top speed', value: v.topSpeed ? `${v.topSpeed} mph` : '—' },
    { icon: Cog, label: 'Gearbox', value: v.transmission },
    { icon: Fuel, label: 'Fuel', value: v.fuelType },
    { icon: Users, label: 'Seats', value: String(v.seats) },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav />

      <main className="pt-[72px]">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <nav aria-label="Breadcrumb" className="py-6 text-[0.8125rem] text-ink-600 flex items-center gap-2">
            <Link href="/cars" className="inline-flex items-center gap-1.5 hover:text-ink-900 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Fleet
            </Link>
            <span>/</span>
            <span className="text-ink-800">{v.brand} {v.model}</span>
          </nav>

          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 xl:gap-16 pb-20">
            {/* LEFT */}
            <div>
              <Gallery images={images} alt={`${v.year} ${v.brand} ${v.model}`} />

              {/* Specs */}
              <Reveal className="mt-12">
                <h2 className="text-[0.6875rem] tracking-[0.24em] uppercase text-ink-600 mb-5">Specification</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-raised rounded-2xl overflow-hidden border border-line">
                  {specs.map((s) => (
                    <div key={s.label} className="bg-canvas p-5">
                      <s.icon className="w-4 h-4 text-accent-600 mb-3" strokeWidth={1.5} />
                      <div className="text-[0.625rem] tracking-[0.16em] uppercase text-ink-600">{s.label}</div>
                      <div className="text-lg num mt-1">{s.value}</div>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Features */}
              {v.features && v.features.length > 0 && (
                <Reveal className="mt-12">
                  <h2 className="text-[0.6875rem] tracking-[0.24em] uppercase text-ink-600 mb-5">Equipment</h2>
                  <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                    {v.features.map((ft) => (
                      <li key={ft} className="flex items-center gap-3 text-[0.9375rem] text-ink-800 py-1">
                        <Check className="w-4 h-4 text-accent-600 shrink-0" strokeWidth={2} />
                        {ft}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}

              {/* Requirements */}
              <Reveal className="mt-12 grid sm:grid-cols-2 gap-4">
                {[
                  { icon: IdCard, t: 'Rental requirements', d: 'Driver aged 25+, licence held 3+ years, valid passport or state ID, and a credit card in the driver\u2019s name.' },
                  { icon: MapPin, t: 'Pickup & return', d: 'Complimentary delivery within 25 miles. Airport kerbside meet available at LAX, JFK, MIA and SFO.' },
                  { icon: ShieldCheck, t: 'Insurance', d: 'Comprehensive cover with a $2,500 excess included. Zero-excess upgrade available at checkout.' },
                  { icon: Calendar, t: 'Cancellation', d: 'Free cancellation up to 48 hours before pickup. 50% refund within 48 hours.' },
                ].map((x) => (
                  <div key={x.t} className="panel rounded-2xl p-6">
                    <x.icon className="w-5 h-5 text-accent-600 mb-3.5" strokeWidth={1.5} />
                    <h3 className="text-[0.9375rem] font-medium mb-2">{x.t}</h3>
                    <p className="text-[0.8125rem] text-ink-700 leading-relaxed">{x.d}</p>
                  </div>
                ))}
              </Reveal>
            </div>

            {/* RIGHT — sticky booking */}
            <div>
              <div className="lg:sticky lg:top-24">
                <div className="eyebrow mb-3">{v.category} · {v.year}</div>
                <h1 className="display text-[clamp(2.4rem,6vw,3.75rem)] mb-4">
                  {v.brand}
                  <span className="block text-ink-700">{v.model}</span>
                </h1>

                <div className="flex items-center gap-3 mb-7">
                  <div className="flex" aria-label={`Rated ${v.rating} out of 5`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(Number(v.rating)) ? 'fill-accent-600 text-accent-600' : 'text-ink-500'}`} />
                    ))}
                  </div>
                  <span className="text-[0.8125rem] text-ink-700">
                    <span className="num text-ink-900">{v.rating}</span> · {v.reviewCount} reviews
                  </span>
                </div>

                {v.description && <p className="text-ink-700 leading-relaxed mb-8">{v.description}</p>}

                <BookingWidget vehicleId={v.id} pricePerDay={Number(v.pricePerDay)} available={v.available !== false} />
              </div>
            </div>
          </div>

          {/* Similar */}
          {similar.length > 0 && (
            <section className="border-t border-line py-20">
              <Reveal className="mb-10">
                <div className="eyebrow mb-3">You may also like</div>
                <h2 className="display text-[clamp(1.9rem,4.5vw,2.75rem)]">Similar vehicles</h2>
              </Reveal>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((s, i) => (
                  <Reveal key={s.id} delay={i * 70}>
                    <VehicleCard v={s} />
                  </Reveal>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
