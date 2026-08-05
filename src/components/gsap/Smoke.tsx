'use client';

import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';

/** Static fractal-noise tile — painted once, then only transformed (cheap). */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='4' seed='7'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='600' height='600' filter='url(%23f)' opacity='0.55'/%3E%3C/svg%3E\")";

type Plume = {
  w: number;
  h: number;
  left: number;
  bottom: number;
  tint: string;
  blur: number;
  opacity: number;
  dur: number;
};

const PLUMES: Plume[] = [
  { w: 46, h: 30, left: -6, bottom: -14, tint: 'rgba(232,252,3,0.30)', blur: 70, opacity: 0.55, dur: 22 },
  { w: 38, h: 26, left: 16, bottom: -18, tint: 'rgba(255,255,255,0.26)', blur: 64, opacity: 0.5, dur: 27 },
  { w: 52, h: 32, left: 38, bottom: -20, tint: 'rgba(232,252,3,0.22)', blur: 82, opacity: 0.45, dur: 31 },
  { w: 34, h: 24, left: 62, bottom: -12, tint: 'rgba(255,255,255,0.22)', blur: 58, opacity: 0.42, dur: 25 },
  { w: 44, h: 30, left: 78, bottom: -18, tint: 'rgba(140,109,227,0.26)', blur: 74, opacity: 0.4, dur: 29 },
  { w: 30, h: 22, left: 48, bottom: 6, tint: 'rgba(255,255,255,0.18)', blur: 52, opacity: 0.34, dur: 19 },
];

/**
 * Drifting volumetric smoke. Pure transform/opacity animation on a handful of
 * blurred gradient plumes, so it stays GPU-cheap despite the large blur radii.
 */
export default function Smoke({ className = '' }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const plumes = gsap.utils.toArray<HTMLElement>('[data-plume]', root.current);
      const grain = root.current?.querySelector<HTMLElement>('[data-grain]');

      if (prefersReducedMotion()) {
        gsap.set(plumes, { opacity: 0.3, scale: 1.05 });
        return;
      }

      plumes.forEach((el, i) => {
        const drift = 90 + i * 26;

        const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'none' } });

        tl.fromTo(
          el,
          { yPercent: 22, xPercent: -12, scale: 0.82, rotate: -6, opacity: 0 },
          {
            yPercent: -105,
            xPercent: 14,
            scale: 1.65,
            rotate: 8,
            duration: PLUMES[i].dur,
            opacity: PLUMES[i].opacity,
            ease: 'sine.inOut',
          },
        ).to(el, { opacity: 0, duration: PLUMES[i].dur * 0.42 }, `-=${PLUMES[i].dur * 0.42}`);

        // Desync so they never pulse together.
        tl.progress(Math.random());

        // Independent lateral wander layered on top of the rise.
        gsap.to(el, {
          x: `+=${drift}`,
          duration: 9 + i * 2.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: -i * 1.7,
        });
      });

      if (grain) {
        gsap.to(grain, {
          backgroundPositionX: '600px',
          backgroundPositionY: '-320px',
          duration: 44,
          ease: 'none',
          repeat: -1,
        });
      }
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {PLUMES.map((p, i) => (
        <div
          key={i}
          data-plume
          className="absolute rounded-[50%] mix-blend-screen will-change-transform"
          style={{
            width: `${p.w}rem`,
            height: `${p.h}rem`,
            left: `${p.left}%`,
            bottom: `${p.bottom}%`,
            background: `radial-gradient(ellipse at 50% 55%, ${p.tint} 0%, ${p.tint.replace(
              /[\d.]+\)$/,
              '0.08)',
            )} 45%, transparent 72%)`,
            filter: `blur(${p.blur}px)`,
            opacity: 0,
          }}
        />
      ))}

      <div
        data-grain
        className="absolute -inset-[30%] opacity-[0.22] mix-blend-overlay will-change-transform"
        style={{ backgroundImage: NOISE, backgroundRepeat: 'repeat' }}
      />
    </div>
  );
}
