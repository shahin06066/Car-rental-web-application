'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, User } from 'lucide-react';
import Logo from './Logo';

const LINKS = [
  { href: '/cars', label: 'Fleet' },
  { href: '/#how', label: 'How it works' },
  { href: '/#reviews', label: 'Reviews' },
  { href: '/admin', label: 'Admin' },
];

export default function SiteNav({ floating = false }: { floating?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      setOpen(false);
      try {
        const raw = localStorage.getItem('user');
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    }, 0);
    return () => clearTimeout(id);
  }, [pathname]);

  const solid = scrolled || !floating;

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          solid
            ? 'bg-canvas/88 backdrop-blur-xl border-b border-line'
            : 'bg-gradient-to-b from-black/45 to-transparent border-b border-transparent'
        }`}
      >
        <nav className="mx-auto max-w-[1400px] px-5 sm:px-8 h-[72px] flex items-center justify-between gap-6">
          <Link href="/" aria-label="Vanguard home" className="shrink-0">
            <Logo light={!solid} />
          </Link>

          <div
            className={`hidden lg:flex items-center gap-9 text-[0.8125rem] tracking-wide ${
              solid ? 'text-ink-700' : 'text-white/85'
            }`}
          >
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:opacity-70 transition-opacity duration-300">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className={`btn !py-2.5 !px-5 !text-[0.8125rem] ${solid ? 'btn-ghost' : 'btn-on-dark'}`}
              >
                <User className="w-4 h-4" /> {user.name.split(' ')[0]}
              </Link>
            ) : (
              <Link
                href="/login"
                className={`text-[0.8125rem] transition-opacity hover:opacity-70 px-2 ${
                  solid ? 'text-ink-700' : 'text-white/85'
                }`}
              >
                Sign in
              </Link>
            )}
            <Link href="/cars" className="btn btn-primary !py-2.5 !px-6 !text-[0.8125rem]">
              Reserve
            </Link>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className={`lg:hidden w-10 h-10 grid place-items-center rounded-xl border ${
              solid ? 'border-line text-ink-900' : 'border-white/45 text-white'
            }`}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <div
          className={`absolute right-0 top-0 h-full w-[82%] max-w-xs bg-raised border-l border-line pt-24 px-6 transition-transform duration-400 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="py-3.5 text-lg border-b border-line text-ink-800">
                {l.label}
              </Link>
            ))}
            <Link href={user ? '/dashboard' : '/login'} className="py-3.5 text-lg border-b border-line text-ink-800">
              {user ? 'My dashboard' : 'Sign in'}
            </Link>
          </div>
          <Link href="/cars" className="btn btn-primary w-full mt-7">
            Reserve a vehicle
          </Link>
        </div>
      </div>
    </>
  );
}
