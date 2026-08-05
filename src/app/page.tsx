import Link from 'next/link';
import { db } from '@/db';
import { vehicles } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { ArrowRight, ShieldCheck, Sparkles, Headphones, CalendarCheck, Star } from 'lucide-react';

import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import VehicleCard from '@/components/VehicleCard';
import Newsletter from '@/components/Newsletter';

import SmoothScroll from '@/components/gsap/SmoothScroll';
import Hero from '@/components/gsap/Hero';
import ScrollHeading from '@/components/gsap/ScrollHeading';
import ScrollStage from '@/components/gsap/ScrollStage';
import VelocityMarquee from '@/components/gsap/VelocityMarquee';
import HorizontalCategories, { type Cat } from '@/components/gsap/HorizontalCategories';
import StepsTimeline from '@/components/gsap/StepsTimeline';
import Parallax from '@/components/gsap/Parallax';
import Magnetic from '@/components/gsap/Magnetic';

import type { VehicleDTO } from '@/lib/types';

export const dynamic = 'force-dynamic';

const BRANDS = ['PORSCHE', 'LAMBORGHINI', 'MERCEDES-BENZ', 'BENTLEY', 'TESLA', 'AUDI', 'LAND ROVER', 'BMW'];

const PEXELS = (id: number, w = 900, h = 1100) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

const CATEGORIES = [
  { key: 'sports', label: 'Sports', image: PEXELS(33345481), blurb: 'Mid-engine theatre and rear-drive purity, for when the drive is the destination.' },
  { key: 'luxury', label: 'Luxury', image: PEXELS(15535501), blurb: 'Hand-stitched interiors and near-silent cabins that rival business class.' },
  { key: 'suv', label: 'SUV', image: PEXELS(15824825), blurb: 'Command the road with space for everyone and everything you bring.' },
  { key: 'electric', label: 'Electric', image: PEXELS(10029873), blurb: 'Instant torque, zero noise. The quietest way to travel quickly.' },
];

const BENEFITS = [
  { icon: ShieldCheck, title: 'Fully insured', body: 'Comprehensive cover and roadside assistance on every rental, with no hidden excess.' },
  { icon: Sparkles, title: 'Hand-selected', body: 'Nine cars, not nine hundred. Every one chosen, serviced and detailed personally.' },
  { icon: Headphones, title: '24/7 concierge', body: 'A real person on the phone within three rings, at any hour, in any city.' },
  { icon: CalendarCheck, title: 'Free cancellation', body: 'Change your mind up to 48 hours before pickup. No fee, no questions asked.' },
];

const REVIEWS = [
  { name: 'Marcus Halloway', region: 'Beverly Hills', car: 'Lamborghini Huracán', quote: 'Arrived spotless, ten minutes early, on a flatbed. That level of care is rare. Vanguard has replaced my dealership entirely.' },
  { name: 'Priya Raghunathan', region: 'Tribeca, New York', car: 'Mercedes-Benz S 580', quote: 'I booked it for a week of client meetings and the rear seats are an office. Billing was transparent — no surprise fees at return.' },
  { name: 'Daniel Okafor', region: 'Miami Beach', car: 'Audi e-tron GT', quote: 'Third rental this year. The whole booking took under two minutes and the car was fully charged and waiting.' },
];

export default async function HomePage() {
  const featured = (await db.select().from(vehicles).orderBy(desc(vehicles.pricePerDay)).limit(6)) as VehicleDTO[];
  const allCategories = await db.select({ category: vehicles.category }).from(vehicles);

  const cats: Cat[] = CATEGORIES.map((c) => ({
    ...c,
    count: allCategories.filter((row) => row.category === c.key).length,
  }));

  return (
    <>
      <SmoothScroll />
      <SiteNav floating />

      <main>
        <Hero />

        {/* ---------- Intro statement ---------- */}
        <section className="mx-auto max-w-[1400px] px-5 sm:px-8 pt-24 sm:pt-32 pb-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-3">
              <div className="eyebrow">Who we are</div>
            </div>
            <div className="lg:col-span-9">
              <ScrollHeading className="display text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.22] text-ink-900 max-w-4xl">
                We keep a <span className="mark">deliberately small garage</span>. Nine cars, each one chosen because it is the best example of what it does — then maintained, detailed and delivered like it belongs to us.
              </ScrollHeading>
            </div>
          </div>
        </section>

        <VelocityMarquee items={BRANDS} />

        {/* ---------- Featured fleet ---------- */}
        <section className="mx-auto max-w-[1400px] px-5 sm:px-8 py-24 sm:py-32">
          <header className="flex flex-wrap items-end justify-between gap-6 pb-8 mb-12 border-b border-line">
            <div>
              <div className="eyebrow mb-5">The collection</div>
              <ScrollHeading className="display text-[clamp(2.25rem,5.5vw,3.75rem)]">
                Featured vehicles
              </ScrollHeading>
            </div>
            <Magnetic>
              <Link href="/cars" className="btn btn-ghost group">
                View all nine
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Magnetic>
          </header>

          <ScrollStage className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((v, i) => (
              <VehicleCard key={v.id} v={v} priority={i < 3} />
            ))}
          </ScrollStage>
        </section>

        <HorizontalCategories cats={cats} />

        {/* ---------- How it works ---------- */}
        <section id="how" className="mx-auto max-w-[1400px] px-5 sm:px-8 py-24 sm:py-32 scroll-mt-24">
          <div className="grid lg:grid-cols-12 gap-10 mb-16">
            <div className="lg:col-span-4">
              <div className="eyebrow mb-5">How it works</div>
              <ScrollHeading className="display text-[clamp(2.25rem,5vw,3.5rem)]">
                Three steps<br />to the keys
              </ScrollHeading>
            </div>
            <div className="lg:col-span-5 lg:col-start-8 flex items-end">
              <p className="lead">
                No counters, no queues and no paperwork on arrival. Everything is settled before the car
                reaches you.
              </p>
            </div>
          </div>
          <StepsTimeline />
        </section>

        {/* ---------- Why Vanguard ---------- */}
        <section className="bg-raised border-y border-line">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-24 sm:py-28 grid lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="eyebrow mb-5">Why Vanguard</div>
              <ScrollHeading className="display text-[clamp(2.1rem,4.6vw,3.25rem)] mb-6">
                The rental experience,<br />properly considered.
              </ScrollHeading>
              <p className="lead mb-9 max-w-md">
                No upsell counters, no worn-out hire cars. Just a small, immaculate fleet and a team that
                treats every booking like a private commission.
              </p>
              <Magnetic>
                <Link href="/cars" className="btn btn-primary">
                  Browse the fleet <ArrowRight className="w-4 h-4" />
                </Link>
              </Magnetic>
            </div>

            <ScrollStage className="lg:col-span-6 lg:col-start-7 grid sm:grid-cols-2 gap-x-10 gap-y-9" y={26} stagger={0.08}>
              {BENEFITS.map((b) => (
                <div key={b.title}>
                  <b.icon className="w-5 h-5 text-accent-600 mb-4" strokeWidth={1.6} />
                  <h3 className="text-[1.0625rem] font-medium text-ink-900 mb-2">{b.title}</h3>
                  <p className="text-[0.9375rem] text-ink-600 leading-relaxed">{b.body}</p>
                </div>
              ))}
            </ScrollStage>
          </div>
        </section>

        {/* ---------- Reviews ---------- */}
        <section id="reviews" className="mx-auto max-w-[1400px] px-5 sm:px-8 py-24 sm:py-32 scroll-mt-24">
          <header className="flex flex-wrap items-end justify-between gap-6 pb-8 mb-12 border-b border-line">
            <div>
              <div className="eyebrow mb-5">Customer reviews</div>
              <ScrollHeading className="display text-[clamp(2.25rem,5.5vw,3.75rem)]">
                Trusted by drivers
              </ScrollHeading>
            </div>
            <div className="flex items-center gap-3 pb-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-accent-600 text-accent-600" />
                ))}
              </div>
              <span className="text-sm text-ink-600">
                <span className="num text-ink-900 font-medium">4.9</span> from 1,284 rentals
              </span>
            </div>
          </header>

          <ScrollStage className="grid gap-x-10 gap-y-12 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <figure key={r.name} className="flex flex-col">
                <div className="label mb-4">{r.car}</div>
                <blockquote className="display text-[1.375rem] leading-[1.45] text-ink-900 flex-1">
                  “{r.quote}”
                </blockquote>
                <figcaption className="mt-7 pt-5 border-t border-line">
                  <div className="text-[0.9375rem] font-medium text-ink-900">{r.name}</div>
                  <div className="text-[0.8125rem] text-ink-500 mt-0.5">{r.region}</div>
                </figcaption>
              </figure>
            ))}
          </ScrollStage>
        </section>

        {/* ---------- Promotion ---------- */}
        <section className="mx-auto max-w-[1400px] px-5 sm:px-8 pb-24 sm:pb-32">
          <div className="relative overflow-hidden rounded-2xl min-h-[420px] flex items-center">
            <Parallax
              src={PEXELS(20150915, 1600, 900)}
              amount={12}
              className="absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-deep via-deep/80 to-deep/25" />
            <div className="relative px-8 sm:px-14 py-16 max-w-lg">
              <div className="eyebrow !text-lime mb-5">Limited offer</div>
              <ScrollHeading className="display display-tight text-[clamp(2rem,4.6vw,3rem)] !text-white mb-5">
                15% off your<br />first weekend.
              </ScrollHeading>
              <p className="text-white/70 mb-8 leading-relaxed">
                Use code{' '}
                <span className="bg-lime text-ink-900 font-semibold tracking-[0.12em] px-2 py-0.5 rounded">
                  WELCOME15
                </span>{' '}
                at checkout
                on any booking of three days or longer.
              </p>
              <Magnetic>
                <Link href="/cars" className="btn btn-on-dark">
                  Claim the offer <ArrowRight className="w-4 h-4" />
                </Link>
              </Magnetic>
            </div>
          </div>
        </section>

        <Newsletter />
      </main>

      <SiteFooter />
    </>
  );
}
