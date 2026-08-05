'use client';

import { useRef } from 'react';
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

/** Seamless marquee that accelerates, reverses and skews with scroll velocity. */
export default function VelocityMarquee({ items }: { items: string[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = root.current?.querySelector<HTMLElement>('[data-track]');
      if (!track || prefersReducedMotion()) return;

      const loop = gsap.to(track, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-9, 9, self.getVelocity() / 260);
          gsap.to(loop, { timeScale: self.direction * (1 + Math.abs(v)), duration: 0.5, overwrite: true });
          gsap.to(track, { skewX: gsap.utils.clamp(-9, 9, -v * 0.9), duration: 0.5, overwrite: true });
        },
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="border-y border-line py-7 overflow-hidden">
      <div data-track className="flex w-max gap-14">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-[0.8125rem] tracking-[0.3em] text-ink-600 whitespace-nowrap select-none">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
