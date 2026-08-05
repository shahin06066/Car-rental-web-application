'use client';

import { useRef } from 'react';
import { gsap, useGSAP, splitLines, prefersReducedMotion, EASE_EXPO } from '@/lib/gsap';

/** Masked line-by-line heading reveal. Use <br /> for explicit line breaks. */
export default function ScrollHeading({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const lines = splitLines(el);
      if (prefersReducedMotion()) return;

      gsap.from(lines, {
        yPercent: 112,
        duration: 1.1,
        ease: EASE_EXPO,
        stagger: 0.11,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    },
    { scope: ref },
  );

  return (
    <h2 ref={ref} className={className}>
      {children}
    </h2>
  );
}
