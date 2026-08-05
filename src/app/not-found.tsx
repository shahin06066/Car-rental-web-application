import Link from 'next/link';
import Logo from '@/components/Logo';

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center px-6 text-center">
      <div>
        <Link href="/" className="inline-block mb-10"><Logo /></Link>
        <div className="eyebrow mb-4">Error 404</div>
        <h1 className="display text-[clamp(3rem,12vw,6rem)] mb-4">Wrong turn.</h1>
        <p className="text-ink-700 max-w-sm mx-auto mb-9">
          The page you were looking for has moved, or never existed. Let&apos;s get you back on the road.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn btn-primary">Back to home</Link>
          <Link href="/cars" className="btn btn-ghost">Browse the fleet</Link>
        </div>
      </div>
    </main>
  );
}
