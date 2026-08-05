'use client';

import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';

/** Scrubbed vertical parallax for background imagery. */
export default function Parallax({
  src,
  amount = 18,
  className = '',
}: {
  src: string;
  amount?: number;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const img = root.current?.querySelector('img');
      if (!img || prefersReducedMotion()) return;

      gsap.fromTo(
        img,
        { yPercent: -amount },
        {
          yPercent: amount,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <div ref={root} className={`overflow-hidden ${className}`}>
      <img src={src} alt="" aria-hidden="true" loading="lazy" decoding="async" className="w-full h-[128%] object-cover" />
    </div>
  );
}
