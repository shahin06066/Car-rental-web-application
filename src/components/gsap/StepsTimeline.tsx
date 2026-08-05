'use client';

import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion, EASE } from '@/lib/gsap';

const STEPS = [
  { n: '01', title: 'Choose your city', body: 'Four cities, one standard. Tell us where and when you want the keys in your hand.' },
  { n: '02', title: 'Select the machine', body: 'Filter by category, power or price. Every car is photographed and specced in full.' },
  { n: '03', title: 'Confirm and collect', body: 'Instant confirmation. We deliver to your door, or meet you kerbside at the terminal.' },
];

export default function StepsTimeline() {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      gsap.from(q('[data-step]'), {
        opacity: 0,
        y: 40,
        duration: 0.95,
        ease: EASE,
        stagger: 0.13,
        scrollTrigger: { trigger: root.current, start: 'top 80%', once: true },
      });

      gsap.fromTo(
        q('[data-bar]'),
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: 'left center',
          duration: 1,
          ease: EASE,
          stagger: 0.13,
          scrollTrigger: { trigger: root.current, start: 'top 80%', once: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <ol ref={root} className="grid sm:grid-cols-3 gap-x-10 gap-y-12">
      {STEPS.map((s) => (
        <li key={s.n} data-step>
          <div data-bar className="h-[2px] bg-ink-900 mb-6" />
          <div className="num text-[0.8125rem] tracking-[0.2em] text-ink-900 bg-lime inline-block px-2 py-1 rounded mb-4">{s.n}</div>
          <h3 className="display text-2xl text-ink-900 mb-3">{s.title}</h3>
          <p className="text-[0.9375rem] text-ink-600 leading-relaxed max-w-xs">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
