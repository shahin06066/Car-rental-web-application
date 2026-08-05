'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export const EASE = 'power3.out';
export const EASE_EXPO = 'expo.out';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Trigger positions are measured at mount, before images have loaded and
 * changed the page height. Without these refreshes, offscreen reveals never
 * fire and pinned sections land in the wrong place.
 */
export function keepScrollTriggersFresh() {
  if (typeof window === 'undefined') return () => {};

  const refresh = () => ScrollTrigger.refresh();

  const onLoad = () => refresh();
  window.addEventListener('load', onLoad);

  // Late-loading images each nudge the layout.
  const imgs = Array.from(document.images).filter((i) => !i.complete);
  imgs.forEach((i) => {
    i.addEventListener('load', refresh, { once: true });
    i.addEventListener('error', refresh, { once: true });
  });

  const ro = new ResizeObserver(() => refresh());
  ro.observe(document.body);

  document.fonts?.ready.then(refresh).catch(() => {});

  const t = window.setTimeout(refresh, 1200);

  return () => {
    window.removeEventListener('load', onLoad);
    imgs.forEach((i) => {
      i.removeEventListener('load', refresh);
      i.removeEventListener('error', refresh);
    });
    ro.disconnect();
    window.clearTimeout(t);
  };
}

/** Wrap each character in a masked span so glyphs can slide up independently. */
export function splitChars(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split === 'true') return Array.from(el.querySelectorAll<HTMLElement>('.sc'));

  const source = el.textContent ?? '';
  el.textContent = '';
  const chars: HTMLElement[] = [];

  source.split(/(\s+)/).forEach((token) => {
    if (token.trim() === '') {
      el.appendChild(document.createTextNode(' '));
      return;
    }

    const word = document.createElement('span');
    word.className = 'inline-block whitespace-nowrap';

    for (const ch of token) {
      const mask = document.createElement('span');
      mask.className = 'inline-block overflow-hidden align-bottom';
      // Give descenders (y, p, g) room inside the mask without shifting the baseline.
      mask.style.paddingBottom = '0.16em';
      mask.style.marginBottom = '-0.16em';

      const inner = document.createElement('span');
      inner.className = 'sc inline-block';
      inner.textContent = ch;

      mask.appendChild(inner);
      word.appendChild(mask);
      chars.push(inner);
    }

    el.appendChild(word);
  });

  el.dataset.split = 'true';
  return chars;
}

/** Wrap each <br>-separated line in a masked span. */
export function splitLines(el: HTMLElement): HTMLElement[] {
  if (el.dataset.splitLines === 'true') return Array.from(el.querySelectorAll<HTMLElement>('.sl'));

  const parts = el.innerHTML.split(/<br\s*\/?>/i);
  el.innerHTML = '';
  const lines: HTMLElement[] = [];

  parts.forEach((part) => {
    const mask = document.createElement('span');
    mask.className = 'block overflow-hidden';
    mask.style.paddingBottom = '0.12em';
    mask.style.marginBottom = '-0.12em';

    const inner = document.createElement('span');
    inner.className = 'sl block';
    inner.innerHTML = part;

    mask.appendChild(inner);
    el.appendChild(mask);
    lines.push(inner);
  });

  el.dataset.splitLines = 'true';
  return lines;
}

export { gsap, ScrollTrigger, useGSAP };
