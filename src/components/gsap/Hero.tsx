'use client';

import { useRef } from 'react';
import { gsap, useGSAP, splitChars, prefersReducedMotion, EASE, EASE_EXPO } from '@/lib/gsap';
import SearchBar from '@/components/SearchBar';
import Smoke from '@/components/gsap/Smoke';

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

      // Reduced motion still animates — just fades, no large travel.
      if (reduced) {
        const tl = gsap.timeline();
        tl.from([chars, q('[data-fade]'), q('[data-search]')], {
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
        .from(q('[data-search]'), { opacity: 0, y: 40, duration: 1.1, ease: EASE_EXPO }, 1.1)
        .from(q('[data-scroll]'), { opacity: 0, duration: 0.8 }, 1.4);

      countUp(tl);

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

      // Lime bloom: breathes, drifts on scroll, tracks the pointer.
      gsap.to(q('[data-glow]'), {
        scale: 1.14,
        opacity: 0.95,
        duration: 5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      gsap.to(q('[data-glow], [data-glow-sm]'), {
        yPercent: 34,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1.2 },
      });

      if (window.matchMedia('(hover: none)').matches) return;

      const glow = q('[data-glow]')[0];
      const xTo = gsap.quickTo(glow, 'x', { duration: 1.2, ease: 'power3' });
      const yTo = gsap.quickTo(glow, 'y', { duration: 1.2, ease: 'power3' });

      const onMove = (e: MouseEvent) => {
        xTo((e.clientX - window.innerWidth / 2) * 0.14);
        yTo((e.clientY - window.innerHeight / 2) * 0.14);
      };

      window.addEventListener('mousemove', onMove);
      return () => window.removeEventListener('mousemove', onMove);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative">
      <div className="relative h-[92svh] min-h-[620px] overflow-hidden">
        <img
          data-img
          src={HERO_IMG}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover object-[60%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep/85 via-deep/45 to-deep/10" />

        {/* Drifting smoke */}
        <Smoke />

        {/* Acid-lime bloom */}
        <div
          data-glow
          aria-hidden="true"
          className="pointer-events-none absolute top-[8%] left-[6%] w-[38rem] h-[38rem] max-w-[85vw] max-h-[85vw] glow-lime blur-[90px] opacity-80 mix-blend-screen"
        />
        <div
          data-glow-sm
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[18%] right-[12%] w-[22rem] h-[22rem] glow-lime blur-[70px] opacity-55 mix-blend-screen hidden sm:block"
        />

        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-canvas via-lime/25 to-transparent" />

        <div className="relative h-full mx-auto max-w-[1400px] px-5 sm:px-8 flex items-center">
          <div data-copy className="max-w-2xl pb-24">
            <div data-eyebrow className="eyebrow !text-lime mb-6">
              Est. 2012 — Four cities
            </div>

            {/*
              Solid white, NOT .text-gradient: splitChars puts every glyph inside a
              transformed span, which breaks the parent's background-clip:text and
              renders the headline invisible.
            */}
            <h1
              data-title
              className="display display-tight text-white text-[clamp(3rem,9vw,6.5rem)] drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]"
            >
              Rent your perfect car.
            </h1>

            <p data-fade className="mt-7 text-lg sm:text-xl text-white/75 max-w-md leading-relaxed">
              A hand-selected fleet of the world&apos;s most desirable machines — delivered, insured and ready
              the moment you land.
            </p>

            <div data-fade className="flex flex-wrap gap-x-10 gap-y-5 mt-10">
              {STATS.map((s, i) => (
                <div key={s.label}>
                  <div className="text-[1.75rem] num tracking-[-0.03em] text-white leading-none">
                    <span data-count={i}>0</span>
                    {s.suffix}
                  </div>
                  <div className="text-[0.625rem] tracking-[0.2em] uppercase text-white/55 mt-1.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          data-scroll
          className="absolute bottom-7 left-1/2 -translate-x-1/2 scroll-hint text-white/60 hidden sm:block"
        >
          <span className="text-[0.625rem] tracking-[0.3em] uppercase">Scroll</span>
        </div>
      </div>

      <div data-search className="relative z-20 mx-auto max-w-[1400px] px-5 sm:px-8 -mt-16 sm:-mt-14">
        <SearchBar />
      </div>
    </section>
  );
}
