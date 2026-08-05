'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { gsap, useGSAP, splitChars, prefersReducedMotion, EASE, EASE_EXPO } from '@/lib/gsap';
import SearchBar from '@/components/SearchBar';
import Magnetic from '@/components/gsap/Magnetic';

const HERO_IMG =
  'https://images.pexels.com/photos/9814982/pexels-photo-9814982.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1920&h=1280';

const STATS = [
  { value: 9, suffix: '', label: 'Vehicles' },
  { value: 4, suffix: '', label: 'Cities' },
  { value: 4.9, suffix: '', label: 'Rating', decimals: 1 },
  { value: 24, suffix: '/7', label: 'Concierge' },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const chars = splitChars(q('[data-title]')[0] as HTMLElement);
      const reduced = prefersReducedMotion();

      const countUp = (tl: gsap.core.Timeline) =>
        STATS.forEach((s, i) => {
          const el = q(`[data-count="${i}"]`)[0];
          if (!el) return;
          const c = { n: 0 };
          tl.to(
            c,
            {
              n: s.value,
              duration: reduced ? 0.6 : 1.3,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = s.decimals ? c.n.toFixed(s.decimals) : String(Math.round(c.n));
              },
            },
            reduced ? 0.2 : 0.95 + i * 0.08,
          );
        });

      if (reduced) {
        const tl = gsap.timeline();
        tl.from([chars, q('[data-fade]'), q('[data-stats]'), q('[data-search]')], {
          opacity: 0,
          duration: 0.5,
          stagger: 0.004,
          ease: 'power1.out',
        });
        countUp(tl);
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: EASE } });

      tl.from(q('[data-img]'), { scale: 1.18, duration: 2.2, ease: EASE_EXPO }, 0)
        .from(q('[data-eyebrow]'), { opacity: 0, y: 12, duration: 0.9 }, 0.35)
        .from(chars, { yPercent: 115, opacity: 0, duration: 1.1, ease: EASE_EXPO, stagger: 0.02 }, 0.45)
        .from(q('[data-fade]'), { opacity: 0, y: 24, duration: 0.95, stagger: 0.1 }, 0.9)
        .from(q('[data-stats]'), { opacity: 0, y: 20, duration: 0.9 }, 1.15)
        .from(q('[data-search]'), { opacity: 0, y: 40, duration: 1.1, ease: EASE_EXPO }, 1.25);

      countUp(tl);

      // Slow parallax on the image, copy and stats as the user scrolls away.
      gsap.to(q('[data-img]'), {
        yPercent: 16,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });

      gsap.to(q('[data-copy]'), {
        yPercent: -22,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '75% top', scrub: true },
      });

      gsap.to(q('[data-stats]'), {
        yPercent: 36,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });

      // One quiet lime bloom — a slow breath, nothing more.
      gsap.to(q('[data-glow]'), {
        scale: 1.1,
        opacity: 0.55,
        duration: 6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative">
      <div className="relative h-[92svh] min-h-[640px] overflow-hidden">
        <img
          data-img
          src={HERO_IMG}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover object-[62%_center]"
        />

        {/* Calm dark-to-clear overlay for legibility, then a clean seam into the page */}
        <div className="absolute inset-0 bg-gradient-to-r from-deep/90 via-deep/40 to-deep/5" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-canvas/90 via-canvas/30 to-transparent" />

        {/* Single subtle lime bloom, low and out of the way of the copy */}
        <div
          data-glow
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-14%] right-[-6%] w-[34rem] h-[34rem] max-w-[80vw] max-h-[80vw] glow-lime blur-[90px] opacity-40 mix-blend-screen"
        />

        <div className="relative h-full mx-auto max-w-[1400px] px-5 sm:px-8 flex flex-col">
          <div className="flex-1 flex items-center">
            <div data-copy className="max-w-2xl pt-24 pb-10">
              <div data-eyebrow className="eyebrow !text-lime mb-6">
                Est. 2012 — Four cities
              </div>

              {/* Solid white: splitChars wraps each glyph in a transformed span,
                  which breaks background-clip:text gradients. */}
              <h1
                data-title
                className="display display-tight text-white text-[clamp(2.75rem,8vw,5.75rem)] drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]"
              >
                Rent your perfect car.
              </h1>

              <p data-fade className="mt-7 text-lg sm:text-xl text-white/75 max-w-md leading-relaxed">
                A hand-selected fleet of the world&apos;s most desirable machines — delivered, insured and ready
                the moment you land.
              </p>

              <div data-fade className="flex flex-wrap items-center gap-4 mt-9">
                <Magnetic>
                  <Link href="/cars" className="btn btn-primary">
                    Browse the fleet <ArrowRight className="w-4 h-4" />
                  </Link>
                </Magnetic>
                <Link href="/#how" className="btn btn-on-dark">
                  How it works
                </Link>
              </div>
            </div>
          </div>

          {/* Structured stats band, separated by a hairline */}
          <div data-stats className="hidden sm:flex items-end justify-between gap-10 border-t border-white/15 py-6 mb-2">
            {STATS.map((s, i) => (
              <div key={s.label} className="flex-1">
                <div className="text-[1.5rem] num tracking-[-0.02em] text-white leading-none">
                  <span data-count={i}>0</span>
                  {s.suffix}
                </div>
                <div className="text-[0.625rem] tracking-[0.2em] uppercase text-white/50 mt-1.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div data-search className="relative z-20 mx-auto max-w-[1400px] px-5 sm:px-8 -mt-16 sm:-mt-14">
        <SearchBar />
      </div>
    </section>
  );
}
