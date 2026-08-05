'use client';

import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';

/** Makes the wrapped element drift toward the cursor on pointer devices. */
export default function Magnetic({ children, strength = 0.34 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current?.firstElementChild as HTMLElement | null;
      if (!el || prefersReducedMotion() || window.matchMedia('(hover: none)').matches) return;

      const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3' });

      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);

      return () => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      };
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className="inline-block">
      {children}
    </span>
  );
}
