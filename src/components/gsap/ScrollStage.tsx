'use client';

import { useRef } from 'react';
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion, EASE } from '@/lib/gsap';

/** Reveals direct children in batches as they enter the viewport. */
export default function ScrollStage({
  children,
  y = 42,
  stagger = 0.09,
  className = '',
}: {
  children: React.ReactNode;
  y?: number;
  stagger?: number;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const items = Array.from(root.current?.children ?? []) as HTMLElement[];
      if (!items.length) return;

      const show = (targets: HTMLElement[], duration: number) =>
        gsap.to(targets, { opacity: 1, y: 0, duration, ease: EASE, stagger, overwrite: true });

      // Reduced motion still fades in — just without the travel.
      if (prefersReducedMotion()) {
        gsap.set(items, { opacity: 0, y: 0 });
        ScrollTrigger.batch(items, {
          start: 'top 96%',
          once: true,
          onEnter: (batch) => show(batch as HTMLElement[], 0.3),
        });
        return;
      }

      gsap.set(items, { opacity: 0, y });

      ScrollTrigger.batch(items, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => show(batch as HTMLElement[], 1),
      });

      // Safety net: if a trigger never fires (bad measurement, aborted load),
      // reveal anything still hidden rather than leaving a blank section.
      const failsafe = window.setTimeout(() => {
        const stuck = items.filter(
          (el) => Number(gsap.getProperty(el, 'opacity')) === 0 && el.getBoundingClientRect().top < window.innerHeight,
        );
        if (stuck.length) show(stuck, 0.4);
      }, 2500);

      return () => window.clearTimeout(failsafe);
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
