'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { gsap, useGSAP, EASE_EXPO } from '@/lib/gsap';
import Smoke from '@/components/gsap/Smoke';

export type Cat = { key: string; label: string; count: number; image: string; blurb: string };

/**
 * Pins the section and translates the card track sideways as the user scrolls.
 * Below 1024px (or with reduced motion) it stays a normal swipeable row,
 * but the photos still animate on entry.
 */
export default function HorizontalCategories({ cats }: { cats: Cat[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      const track = section?.querySelector<HTMLElement>('[data-track]');
      if (!section || !track) return;

      const cards = gsap.utils.toArray<HTMLElement>('[data-card]', track);
      const img = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-card-img]');
      const body = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-card-body]');

      const mm = gsap.matchMedia();

      /* ---------- Desktop: pinned horizontal scroll ---------- */
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 96);

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            // Shorter than the travel distance so the pin releases quickly.
            end: () => `+=${distance() * 0.75}`,
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        cards.forEach((card) => {
          const common = {
            trigger: card,
            containerAnimation: tween,
            start: 'left right',
            end: 'right left',
            scrub: true,
          } as const;

          // Counter-drift: the photo slides against the card for depth.
          gsap.fromTo(
            img(card),
            { xPercent: -9, scale: 1.26 },
            { xPercent: 9, scale: 1.1, ease: 'none', scrollTrigger: common },
          );

          // Card tilts and lifts slightly as it crosses the viewport centre.
          gsap.fromTo(
            card,
            { rotate: 1.1, y: 26 },
            {
              rotate: -1.1,
              y: -26,
              ease: 'none',
              scrollTrigger: { ...common, scrub: 1 },
            },
          );

          // Caption fades up as the card reaches centre stage.
          gsap.fromTo(
            body(card),
            { autoAlpha: 0.35, y: 26 },
            {
              autoAlpha: 1,
              y: 0,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: 'left 88%',
                end: 'center 62%',
                scrub: true,
              },
            },
          );
        });

        gsap.to('[data-progress]', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${distance() * 0.75}`, scrub: 0.5 },
        });
      });

      /* ---------- Mobile / tablet: reveal photos on entry ---------- */
      mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
        cards.forEach((card) => {
          gsap.from(img(card), {
            scale: 1.3,
            duration: 1.3,
            ease: EASE_EXPO,
            scrollTrigger: { trigger: card, start: 'top 92%', once: true },
          });

          gsap.from(body(card), {
            autoAlpha: 0,
            y: 28,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 88%', once: true },
          });
        });
      });

      /* ---------- Hover: zoom the photo, on pointer devices ---------- */
      mm.add('(hover: hover) and (prefers-reduced-motion: no-preference)', () => {
        const cleanups = cards.map((card) => {
          const target = img(card);
          if (!target) return () => {};

          const zoom = gsap.quickTo(target, 'scale', { duration: 0.75, ease: 'power3' });
          const base = () => Number(gsap.getProperty(target, 'scale')) || 1.1;

          let resting = base();
          const enter = () => {
            resting = base();
            zoom(resting * 1.08);
          };
          const leave = () => zoom(resting);

          card.addEventListener('mouseenter', enter);
          card.addEventListener('mouseleave', leave);
          return () => {
            card.removeEventListener('mouseenter', enter);
            card.removeEventListener('mouseleave', leave);
          };
        });

        return () => cleanups.forEach((fn) => fn());
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative bg-deep lg:h-[100svh] lg:overflow-hidden">
      <Smoke className="opacity-70" />

      <div className="relative lg:h-full lg:flex lg:flex-col lg:justify-center py-20 lg:py-0">
        <div className="mx-auto max-w-[1400px] w-full px-5 sm:px-8 mb-12 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="eyebrow !text-lime mb-5">Browse by type</div>
            <h2 className="display text-[clamp(2rem,5vw,3.25rem)] !text-white">Popular categories</h2>
          </div>
          <p className="hidden lg:block text-[0.75rem] tracking-[0.2em] uppercase text-white/45">Scroll to explore →</p>
        </div>

        <div className="lg:pl-[max(1.25rem,calc((100vw-1400px)/2+2rem))] overflow-x-auto lg:overflow-visible no-scrollbar">
          <div data-track className="flex gap-5 px-5 sm:px-8 lg:px-0 w-max">
            {cats.map((c) => (
              <Link
                key={c.key}
                href={`/cars?category=${c.key}`}
                data-card
                className="group relative w-[78vw] sm:w-[380px] lg:w-[420px] h-[420px] lg:h-[460px] shrink-0 rounded-3xl overflow-hidden border border-white/10 hover:border-lime/60 transition-colors"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    data-card-img
                    src={c.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover will-change-transform"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-deep/95 via-deep/35 to-transparent" />

                <div data-card-body className="relative h-full p-8 flex flex-col justify-end">
                  <div className="text-[0.625rem] tracking-[0.24em] uppercase text-lime mb-2.5">
                    {c.count} available
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="display text-4xl text-white">{c.label}</h3>
                    <span className="w-11 h-11 rounded-full border border-white/50 grid place-items-center shrink-0 group-hover:bg-lime group-hover:border-lime group-hover:text-ink-900 transition-all duration-300">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-[0.875rem] text-white/70 mt-3 max-w-[85%] leading-relaxed">{c.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden lg:block mx-auto max-w-[1400px] w-full px-5 sm:px-8 mt-10">
          <div className="h-px bg-white/15 relative overflow-hidden">
            <span data-progress className="absolute inset-0 bg-lime origin-left scale-x-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
