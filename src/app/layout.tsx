import type { Metadata } from 'next';

import SiteHeader from '@/components/layout/SiteHeader';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Showcase — sitios profesionales',
    template: '%s | Showcase',
  },
  description:
    'Catálogo de templates reales para producir sitios profesionales estáticos con pedido estructurado.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
