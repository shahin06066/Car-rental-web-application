import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap', weight: ['400', '500', '600'] });

const SITE = 'https://vanguard.example.com';

export const viewport: Viewport = {
  themeColor: '#f7f7f8',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Vanguard — Premium Car Rental in LA, NY, Miami & SF',
    template: '%s | Vanguard',
  },
  description:
    'Rent your perfect car from a hand-selected fleet of sports, luxury, SUV and electric vehicles. Free delivery, full insurance and 24/7 concierge across four cities.',
  keywords: ['luxury car rental', 'sports car hire', 'premium car rental', 'exotic car rental', 'Los Angeles', 'Miami'],
  openGraph: {
    type: 'website',
    siteName: 'Vanguard Motors',
    title: 'Vanguard — Premium Car Rental',
    description: 'A hand-selected fleet of the world\u2019s most desirable machines. Delivered, insured and ready.',
    url: SITE,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vanguard — Premium Car Rental',
    description: 'A hand-selected fleet of the world\u2019s most desirable machines.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.pexels.com" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
      </head>
      <body className="antialiased">
        {children}
        <Toaster
          position="bottom-right"
          theme="light"
          toastOptions={{
            style: { background: '#ffffff', border: '1px solid #e3e2e6', color: '#1a191d' },
          }}
        />
      </body>
    </html>
  );
}
