'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion, keepScrollTriggersFresh } from '@/lib/gsap';

/**
 * Lenis smooth scrolling driven by the GSAP ticker so ScrollTrigger stays in sync.
 * Touch scrolling stays native — only the wheel is smoothed.
 */
export default function SmoothScroll() {
  useEffect(() => {
    // Runs even with reduced motion, otherwise scroll-triggered reveals
    // would never recalculate and content could stay hidden.
    const stopRefreshing = keepScrollTriggersFresh();

    // Verifiable in devtools: <html data-gsap="ready">
    document.documentElement.dataset.gsap = 'ready';

    if (prefersReducedMotion()) return stopRefreshing;

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Route in-page anchors through Lenis so they ease instead of jumping.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      if (url.pathname !== window.location.pathname) return;
      const el = url.hash && document.querySelector(url.hash);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -80 });
    };

    document.addEventListener('click', onClick);
    ScrollTrigger.refresh();

    return () => {
      stopRefreshing();
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return null;
}
