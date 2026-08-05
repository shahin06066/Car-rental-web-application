import Link from 'next/link';
import Logo from './Logo';

export default function AuthShell({
  title,
  sub,
  children,
  footer,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden lg:block grain overflow-hidden">
        <img
          src="https://images.pexels.com/photos/33345481/pexels-photo-33345481.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=1600"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/45 to-deep/20" />
        <div className="absolute bottom-0 p-14">
          <div className="eyebrow !text-lime mb-4">Vanguard Motors</div>
          <p className="display text-4xl max-w-sm leading-tight text-white">
            Nine cars.
            <br />
            Four cities.
            <br />
            One standard.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex flex-col justify-center px-5 sm:px-12 py-14">
        <div className="w-full max-w-sm mx-auto">
          <Link href="/" className="inline-block mb-12">
            <Logo />
          </Link>

          <h1 className="display text-4xl mb-2">{title}</h1>
          <p className="text-sm text-white/65 mb-9">{sub}</p>

          {children}

          <div className="mt-8 text-sm text-white/65">{footer}</div>
        </div>
      </div>
    </div>
  );
}
