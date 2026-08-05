import Link from 'next/link';
import Logo from './Logo';

const COLS = [
  { title: 'Fleet', links: [['Sports', '/cars?category=sports'], ['Luxury', '/cars?category=luxury'], ['SUV', '/cars?category=suv'], ['Electric', '/cars?category=electric']] },
  { title: 'Company', links: [['How it works', '/#how'], ['Reviews', '/#reviews'], ['Locations', '/cars'], ['Admin', '/admin']] },
  { title: 'Account', links: [['Sign in', '/login'], ['Create account', '/register'], ['My bookings', '/dashboard'], ['Support', '/#faq']] },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/12 bg-deep text-white/70">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-16 grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo light />
          <p className="text-sm text-white/55 mt-5 max-w-xs leading-relaxed">
            A hand-selected collection of the world&apos;s finest vehicles, delivered to your door across four cities.
          </p>
          <div className="flex gap-2.5 mt-6">
            {['LA', 'NY', 'MIA', 'SF'].map((c) => (
              <span key={c} className="text-[0.625rem] tracking-[0.2em] px-2.5 py-1.5 rounded-md border border-white/20 text-white/55">
                {c}
              </span>
            ))}
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <div className="text-[0.6875rem] tracking-[0.24em] uppercase text-white/40 mb-5">{col.title}</div>
            <ul className="space-y-3">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-white/65 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/12">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-6 flex flex-col sm:flex-row gap-3 justify-between text-xs text-white/40">
          <span>© {new Date().getFullYear()} Vanguard Motors. All rights reserved.</span>
          <span>Privacy · Terms · Insurance policy</span>
        </div>
      </div>
    </footer>
  );
}
