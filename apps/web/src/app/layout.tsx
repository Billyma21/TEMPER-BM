import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/shell/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'TEMPER', template: '%s · TEMPER' },
  description: 'Le système de gestion intégré de la chocolaterie : personnel, badges, production, qualité, stocks, ventes.',
  authors: [{ name: 'MAAYOUD' }],
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#2b1a12',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@1&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
