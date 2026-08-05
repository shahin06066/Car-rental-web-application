'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Rotate3d } from 'lucide-react';

export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);

  const go = (n: number) => setI((n + images.length) % images.length);

  // Drag horizontally to "spin" through the angles — a lightweight 360 feel
  const onMove = (x: number) => {
    if (drag === null) return;
    const dx = x - drag;
    if (Math.abs(dx) > 42) {
      go(i + (dx < 0 ? 1 : -1));
      setDrag(x);
    }
  };

  return (
    <div>
      <div
        className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-ink-800 border border-white/12 select-none cursor-grab active:cursor-grabbing group"
        onMouseDown={(e) => setDrag(e.clientX)}
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseUp={() => setDrag(null)}
        onMouseLeave={() => setDrag(null)}
        onTouchStart={(e) => setDrag(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={() => setDrag(null)}
      >
        {images.map((src, idx) => (
          <img
            key={src + idx}
            src={src}
            alt={idx === 0 ? alt : `${alt} — view ${idx + 1}`}
            loading={idx === 0 ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              idx === i ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-deep/35 via-transparent to-transparent pointer-events-none" />

        <span className="absolute top-4 left-4 flex items-center gap-1.5 text-[0.625rem] tracking-[0.18em] uppercase px-2.5 py-1.5 rounded-md bg-black/55 backdrop-blur border border-white/16 text-white/75">
          <Rotate3d className="w-3 h-3" /> Drag to rotate
        </span>

        {images.length > 1 && (
          <>
            <button
              onClick={() => go(i - 1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-full bg-black/55 backdrop-blur border border-white/18 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => go(i + 1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-full bg-black/55 backdrop-blur border border-white/18 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Go to image ${idx + 1}`}
              className={`h-1 rounded-full transition-all duration-300 ${idx === i ? 'w-7 bg-lime' : 'w-4 bg-white/40 hover:bg-white/55'}`}
            />
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2.5 mt-2.5">
          {images.map((src, idx) => (
            <button
              key={src + idx}
              onClick={() => setI(idx)}
              aria-label={`View image ${idx + 1}`}
              className={`aspect-[4/3] rounded-lg overflow-hidden border transition-all duration-300 ${
                idx === i ? 'border-lime opacity-100' : 'border-white/14 opacity-45 hover:opacity-85'
              }`}
            >
              <img src={src} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
